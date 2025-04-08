export interface Empresa {
  id?: number;
  cnpj: string;
  nomeFantasia: string;
  cep: string;
  fornecedores?: Fornecedor[];
}

export type TipoPessoa = 'FISICA' | 'JURIDICA';

export interface Fornecedor {
  id?: number;
  documento: string;
  nome: string;
  email: string;
  cep: string;
  tipoPessoa: TipoPessoa;
  rg?: string;
  dataNascimento?: Date;
  empresas?: Empresa[];
}
