import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { MessageService } from 'primeng/api';
import { Empresa, Fornecedor, TipoPessoa } from '../../models/empresa.model';
import { firstValueFrom } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-empresa-fornecedor',
  templateUrl: './empresa-fornecedor.component.html',
  styleUrls: ['./empresa-fornecedor.component.css']
})
export class EmpresaFornecedorComponent implements OnInit, OnDestroy {
  empresas: Empresa[] = [];
  fornecedores: Fornecedor[] = [];
  empresaSelecionada: Empresa | null = null;
  empresaSelecionadaEdicao: Empresa = {
    cnpj: '',
    nomeFantasia: '',
    cep: ''
  };
  fornecedorSelecionado: Fornecedor = {
    documento: '',
    nome: '',
    email: '',
    cep: '',
    tipoPessoa: 'JURIDICA'
  };
  fornecedoresSelecionados: Fornecedor[] = [];
  loading = false;
  displayDialog = false;
  displayFornecedorDialog = false;
  displayEmpresaDialog = false;
  modoEdicao = false;
  modoEdicaoEmpresa = false;
  filtroNome = '';
  filtroDocumento = '';
  filtroNomeEmpresa = '';
  filtroCnpjEmpresa = '';
  empresasFiltradas: Empresa[] = [];
  maxDate: Date = new Date();
  tiposPessoa = [
    { label: 'Pessoa Física', value: 'FISICA' },
    { label: 'Pessoa Jurídica', value: 'JURIDICA' }
  ];
  private routerSubscription: Subscription | null = null;

  constructor(
    private apiService: ApiService,
    private messageService: MessageService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.carregarDados();
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.carregarDados();
    });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  async carregarDados() {
    try {
      await Promise.all([
        this.carregarEmpresas(),
        this.carregarFornecedores()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao carregar dados'
      });
    }
  }

  async carregarEmpresas() {
    try {
      this.loading = true;
      const empresas = await firstValueFrom(this.apiService.getEmpresas()) || [];
      this.empresas = empresas;
      this.empresasFiltradas = empresas;

      for (const empresa of this.empresas) {
        if (empresa.id) {
          try {
            empresa.fornecedores = await firstValueFrom(this.apiService.getFornecedoresEmpresa(empresa.id));
          } catch (error) {
            console.error(`Erro ao carregar fornecedores da empresa ${empresa.id}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao carregar empresas'
      });
    } finally {
      this.loading = false;
    }
  }

  async carregarFornecedores() {
    try {
      this.loading = true;

      if (!this.filtroNome && !this.filtroDocumento) {
        this.fornecedores = await firstValueFrom(this.apiService.getFornecedores()) || [];
        return;
      }

      this.fornecedores = await firstValueFrom(this.apiService.getFornecedores(
        this.filtroNome || undefined,
        this.filtroDocumento || undefined
      )) || [];
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao carregar fornecedores'
      });
    } finally {
      this.loading = false;
    }
  }

  async carregarEmpresa(id: number) {
    try {
      this.loading = true;
      const response = await firstValueFrom<Empresa>(this.apiService.getEmpresa(id));
      this.empresaSelecionada = response;
      this.displayEmpresaDialog = true;
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao carregar detalhes da empresa'
      });
    } finally {
      this.loading = false;
    }
  }

  async carregarFornecedor(id: number) {
    try {
      this.loading = true;
      const response = await firstValueFrom<Fornecedor>(this.apiService.getFornecedor(id));
      this.fornecedorSelecionado = response;
      this.displayFornecedorDialog = true;
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao carregar detalhes do fornecedor'
      });
    } finally {
      this.loading = false;
    }
  }

  abrirDialog(empresa: Empresa) {
    this.empresaSelecionada = { ...empresa };
    this.fornecedoresSelecionados = [...(empresa.fornecedores || [])];
    this.displayDialog = true;
  }

  fecharDialog() {
    this.displayDialog = false;
    this.empresaSelecionada = null;
    this.fornecedoresSelecionados = [];
  }

  fecharEmpresaDialog() {
    this.displayEmpresaDialog = false;
    this.empresaSelecionada = null;
  }

  fecharFornecedorDialog() {
    this.displayFornecedorDialog = false;
    this.fornecedorSelecionado = {
      documento: '',
      nome: '',
      email: '',
      cep: '',
      tipoPessoa: 'JURIDICA'
    };
  }

  abrirDialogFornecedor(fornecedor?: Fornecedor) {
    this.modoEdicao = !!fornecedor;
    if (fornecedor) {
      this.fornecedorSelecionado = {
        ...fornecedor,
        dataNascimento: fornecedor.dataNascimento ? new Date(fornecedor.dataNascimento) : undefined
      };
    } else {
      this.fornecedorSelecionado = {
        documento: '',
        nome: '',
        email: '',
        cep: '',
        tipoPessoa: 'JURIDICA'
      };
    }
    this.displayFornecedorDialog = true;
  }

  async salvarVinculos() {
    if (this.empresaSelecionada?.id) {
      try {
        this.loading = true;
        const empresaId = this.empresaSelecionada.id;

        const cepInfo = await this.apiService.validarCep(this.empresaSelecionada.cep);
        const isParana = cepInfo.uf === 'PR';

        if (isParana) {
          for (const fornecedor of this.fornecedoresSelecionados) {
            if (fornecedor.tipoPessoa === 'FISICA') {
              if (!fornecedor.dataNascimento) {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Erro',
                  detail: `Fornecedor ${fornecedor.nome} precisa ter data de nascimento cadastrada para vinculação no Paraná`
                });
                return;
              }

              const idade = this.calcularIdade(fornecedor.dataNascimento);
              if (idade < 18) {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Erro',
                  detail: `Não é permitido vincular o fornecedor ${fornecedor.nome} por ser menor de idade no Paraná`
                });
                return;
              }
            }
          }
        }

        const fornecedoresAtuais = await firstValueFrom(this.apiService.getFornecedoresEmpresa(empresaId));
        const fornecedoresAtuaisIds = fornecedoresAtuais.map(f => f.id);
        const fornecedoresSelecionadosIds = this.fornecedoresSelecionados.map(f => f.id);

        const fornecedoresParaVincular = this.fornecedoresSelecionados
          .filter(f => f.id && !fornecedoresAtuaisIds.includes(f.id))
          .map(f => f.id!);

        const fornecedoresParaDesvincular = fornecedoresAtuais
          .filter(f => f.id && !fornecedoresSelecionadosIds.includes(f.id))
          .map(f => f.id!);

        try {

          for (const fornecedorId of fornecedoresParaVincular) {
            await firstValueFrom(this.apiService.vincularFornecedor(empresaId, fornecedorId));
          }

          for (const fornecedorId of fornecedoresParaDesvincular) {
            await firstValueFrom(this.apiService.desvincularFornecedor(empresaId, fornecedorId));
          }

          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Fornecedores vinculados com sucesso'
          });

          this.fecharDialog();
          await this.carregarEmpresas();
        } catch (error: any) {
          console.error('Erro ao vincular/desvincular fornecedores:', error);
          let errorDetail = 'Erro ao vincular fornecedores';

          if (error.status === 400) {
            errorDetail = error.message;
          } else if (error.status === 404) {
            errorDetail = 'Empresa ou fornecedor não encontrado';
          } else if (error.status === 500) {
            errorDetail = 'Erro interno do servidor';
          }

          this.messageService.add({
            severity: 'error',
            summary: `Erro ${error.status}`,
            detail: errorDetail,
            life: 5000
          });
        }
      } catch (error: any) {
        console.error('Erro ao carregar fornecedores:', error);
        this.messageService.add({
          severity: 'error',
          summary: `Erro ${error.status || ''}`,
          detail: error.message || 'Erro ao carregar fornecedores',
          life: 5000
        });
      } finally {
        this.loading = false;
      }
    }
  }

  private async validarDocumentoUnico(documento: string, id?: number): Promise<boolean> {
    try {
      const fornecedores = await firstValueFrom(this.apiService.getFornecedores('', documento));

      if (fornecedores.length === 0) {
        return true;
      }

      if (id && fornecedores.length === 1) {
        return fornecedores[0].id === id;
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  private async validarCEP(cep: string): Promise<boolean> {
    try {
      await this.apiService.validarCep(cep);
      return true;
    } catch (error) {
      return false;
    }
  }

  private async validarIdadeFornecedor(dataNascimento: Date, cep: string): Promise<boolean> {
    try {
      const cepInfo = await this.apiService.validarCep(cep);
      if (cepInfo.uf === 'PR') {
        const idade = this.calcularIdade(dataNascimento);
        return idade >= 18;
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  private calcularIdade(dataNascimento: Date): number {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();

    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }

    return idade;
  }

  async salvarFornecedor() {
    if (this.fornecedorSelecionado) {
      try {
        this.loading = true;

        if (!this.fornecedorSelecionado.nome?.trim()) {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Nome é obrigatório'
          });
          return;
        }

        if (!this.fornecedorSelecionado.documento?.trim()) {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'CPF/CNPJ é obrigatório'
          });
          return;
        }

        if (!this.fornecedorSelecionado.email?.trim()) {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Email é obrigatório'
          });
          return;
        }

        if (!this.fornecedorSelecionado.cep?.trim()) {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'CEP é obrigatório'
          });
          return;
        }

        if (!/^\d{8}$/.test(this.fornecedorSelecionado.cep)) {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'CEP deve conter 8 dígitos numéricos'
          });
          return;
        }
        const cepInfo = await this.apiService.validarCep(this.fornecedorSelecionado.cep);
        if (this.fornecedorSelecionado.tipoPessoa === 'FISICA') {
          if (!this.fornecedorSelecionado.rg) {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'RG é obrigatório para pessoa física'
            });
            return;
          }

          if (!this.fornecedorSelecionado.dataNascimento) {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Data de nascimento é obrigatória para pessoa física'
            });
            return;
          }

          if (this.modoEdicao && this.fornecedorSelecionado.id) {
            try {
              const empresasVinculadas = await firstValueFrom(this.apiService.getEmpresasFornecedor(this.fornecedorSelecionado.id));

              for (const empresa of empresasVinculadas) {
                const empresaCepInfo = await this.apiService.validarCep(empresa.cep);
                if (empresaCepInfo.uf === 'PR') {
                  const idade = this.calcularIdade(this.fornecedorSelecionado.dataNascimento);
                  if (idade < 18) {
                    this.messageService.add({
                      severity: 'error',
                      summary: 'Erro',
                      detail: 'Não é permitido editar a data de nascimento de um fornecedor pessoa física menor de idade vinculado a uma empresa do Paraná'
                    });
                    return;
                  }
                }
              }
            } catch (error) {
              console.error('Erro ao verificar empresas vinculadas:', error);
            }
          }
        }
        if (!await this.validarDocumentoUnico(this.fornecedorSelecionado.documento, this.fornecedorSelecionado.id)) {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'CPF/CNPJ já cadastrado'
          });
          return;
        }

        if (this.modoEdicao && this.fornecedorSelecionado.id) {
          await firstValueFrom<Fornecedor>(this.apiService.updateFornecedor(this.fornecedorSelecionado.id, this.fornecedorSelecionado));
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Fornecedor atualizado com sucesso'
          });
        } else {
          await firstValueFrom<Fornecedor>(this.apiService.createFornecedor(this.fornecedorSelecionado));
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Fornecedor criado com sucesso'
          });
        }
        this.fecharFornecedorDialog();
        await this.carregarFornecedores();
      } catch (error: any) {
        console.error('Erro ao salvar fornecedor:', error);
        let errorDetail = 'Erro ao salvar fornecedor';

        if (error.status === 400) {
          if (error.error?.details && Array.isArray(error.error.details)) {
            errorDetail = error.error.details.join('\n');
          } else if (error.error?.message) {
            errorDetail = error.error.message;
          }
        } else if (error.status === 404) {
          errorDetail = 'Fornecedor não encontrado';
        } else if (error.status === 500) {
          errorDetail = 'Erro interno do servidor';
        }

        this.messageService.add({
          severity: 'error',
          summary: `Erro ${error.status}`,
          detail: errorDetail,
          life: 5000
        });
      } finally {
        this.loading = false;
      }
    }
  }

  async excluirFornecedor(id: number) {
    try {
      await firstValueFrom<void>(this.apiService.deleteFornecedor(id));
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Fornecedor excluído com sucesso'
      });
      this.carregarFornecedores();
    } catch (error: any) {
      console.error('Erro ao excluir fornecedor:', error);

      if (error.status === 400 && error.error?.details?.some((detail: string) =>
          detail.includes('violates foreign key constraint') &&
          detail.includes('empresa_fornecedor'))) {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não é possível excluir o fornecedor pois ele está vinculado a uma ou mais empresas. Por favor, desvincule o fornecedor das empresas antes de excluí-lo.',
          life: 8000
        });
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao excluir fornecedor'
        });
      }
    }
  }

  removerFornecedor(fornecedor: Fornecedor) {
    this.fornecedoresSelecionados = this.fornecedoresSelecionados.filter(f => f.id !== fornecedor.id);
  }

  abrirDialogEmpresa(empresa?: Empresa) {
    this.modoEdicaoEmpresa = !!empresa;
    this.empresaSelecionadaEdicao = empresa ? { ...empresa } : {
      cnpj: '',
      nomeFantasia: '',
      cep: ''
    };
    this.displayEmpresaDialog = true;
  }

  fecharDialogEmpresa() {
    this.displayEmpresaDialog = false;
    this.empresaSelecionadaEdicao = {
      cnpj: '',
      nomeFantasia: '',
      cep: ''
    };
    this.modoEdicaoEmpresa = false;
  }

  async salvarEmpresa() {
    try {
      this.loading = true;

      if (!this.empresaSelecionadaEdicao.nomeFantasia?.trim()) {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Nome Fantasia é obrigatório'
        });
        return;
      }

      if (!this.empresaSelecionadaEdicao.cnpj?.trim()) {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'CNPJ é obrigatório'
        });
        return;
      }

      if (!this.empresaSelecionadaEdicao.cep?.trim()) {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'CEP é obrigatório'
        });
        return;
      }

      if (!/^\d{8}$/.test(this.empresaSelecionadaEdicao.cep)) {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'CEP deve conter 8 dígitos numéricos'
        });
        return;
      }
      const cepInfo = await this.apiService.validarCep(this.empresaSelecionadaEdicao.cep);

      if (this.modoEdicaoEmpresa && this.empresaSelecionadaEdicao.id) {
        await firstValueFrom(this.apiService.updateEmpresa(this.empresaSelecionadaEdicao.id, this.empresaSelecionadaEdicao));
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Empresa atualizada com sucesso'
        });
      } else {
        await firstValueFrom(this.apiService.createEmpresa(this.empresaSelecionadaEdicao));
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Empresa criada com sucesso'
        });
      }
      this.fecharDialogEmpresa();
      await this.carregarEmpresas();
    } catch (error: any) {
      console.error('Erro ao salvar empresa:', error);
      let errorDetail = 'Erro ao salvar empresa';

      if (error.status === 400) {
        if (error.error?.details && Array.isArray(error.error.details)) {
          errorDetail = error.error.details.join('\n');
        } else if (error.error?.message) {
          errorDetail = error.error.message;
        }
      } else if (error.status === 404) {
        errorDetail = 'Empresa não encontrada';
      } else if (error.status === 500) {
        errorDetail = 'Erro interno do servidor';
      }

      this.messageService.add({
        severity: 'error',
        summary: `Erro ${error.status}`,
        detail: errorDetail,
        life: 5000
      });
    } finally {
      this.loading = false;
    }
  }

  async excluirEmpresa(id: number) {
    try {
      await firstValueFrom(this.apiService.deleteEmpresa(id));
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Empresa excluída com sucesso'
      });
      await this.carregarEmpresas();
    } catch (error: any) {
      console.error('Erro ao excluir empresa:', error);
      let errorDetail = 'Erro ao excluir empresa';

      if (error.status === 400) {
        errorDetail = error.message;
      } else if (error.status === 404) {
        errorDetail = 'Empresa não encontrada';
      } else if (error.status === 500) {
        errorDetail = 'Erro interno do servidor';
      }

      this.messageService.add({
        severity: 'error',
        summary: `Erro ${error.status}`,
        detail: errorDetail,
        life: 5000
      });
    }
  }

  aplicarFiltros() {
    this.carregarFornecedores();
  }

  limparFiltros() {
    this.filtroNome = '';
    this.filtroDocumento = '';
    this.carregarFornecedores();
  }

  aplicarFiltrosEmpresa() {
    if (!this.filtroNomeEmpresa && !this.filtroCnpjEmpresa) {
      this.empresasFiltradas = [...this.empresas];
      return;
    }

    this.empresasFiltradas = this.empresas.filter(empresa => {
      const nomeMatch = this.filtroNomeEmpresa ?
        empresa.nomeFantasia.toLowerCase().includes(this.filtroNomeEmpresa.toLowerCase()) :
        false;

      const cnpjMatch = this.filtroCnpjEmpresa ?
        empresa.cnpj.includes(this.filtroCnpjEmpresa) :
        false;

      return nomeMatch || cnpjMatch;
    });
  }

  limparFiltrosEmpresa() {
    this.filtroNomeEmpresa = '';
    this.filtroCnpjEmpresa = '';
    this.empresasFiltradas = [...this.empresas];
  }
}
