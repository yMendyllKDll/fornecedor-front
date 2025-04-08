import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, firstValueFrom, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Empresa, Fornecedor } from '../models/empresa.model';
import { ApiError } from '../models/api-error.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8080/fornecedor-api/api';

  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocorreu um erro desconhecido';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      if (error.error) {
        if (typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (typeof error.error === 'object') {
          const apiError = error.error as ApiError;
          errorMessage = apiError.message || apiError.error || 'Erro no servidor';
        }
      }
    }

    return throwError(() => ({
      message: errorMessage,
      status: error.status,
      error: error.error
    }));
  }

  getEmpresas(): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(`${this.baseUrl}/empresas`)
      .pipe(catchError(this.handleError));
  }

  getEmpresa(id: number): Observable<Empresa> {
    return this.http.get<Empresa>(`${this.baseUrl}/empresas/${id}`)
      .pipe(catchError(this.handleError));
  }

  createEmpresa(empresa: Empresa): Observable<Empresa> {
    return this.http.post<Empresa>(`${this.baseUrl}/empresas`, empresa)
      .pipe(catchError(this.handleError));
  }

  updateEmpresa(id: number, empresa: Empresa): Observable<Empresa> {
    return this.http.put<Empresa>(`${this.baseUrl}/empresas/${id}`, empresa)
      .pipe(catchError(this.handleError));
  }

  deleteEmpresa(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/empresas/${id}`)
      .pipe(catchError(this.handleError));
  }

  getFornecedores(nome?: string, documento?: string): Observable<Fornecedor[]> {
    let url = `${this.baseUrl}/fornecedores`;
    const params: string[] = [];

    if (nome) {
      params.push(`nome=${encodeURIComponent(nome)}`);
    }
    if (documento) {
      params.push(`documento=${encodeURIComponent(documento)}`);
    }

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    return this.http.get<Fornecedor[]>(url)
      .pipe(catchError(this.handleError));
  }

  getFornecedor(id: number): Observable<Fornecedor> {
    return this.http.get<Fornecedor>(`${this.baseUrl}/fornecedores/${id}`)
      .pipe(catchError(this.handleError));
  }

  createFornecedor(fornecedor: Fornecedor): Observable<Fornecedor> {
    return this.http.post<Fornecedor>(`${this.baseUrl}/fornecedores`, fornecedor)
      .pipe(catchError(this.handleError));
  }

  updateFornecedor(id: number, fornecedor: Fornecedor): Observable<Fornecedor> {
    return this.http.put<Fornecedor>(`${this.baseUrl}/fornecedores/${id}`, fornecedor)
      .pipe(catchError(this.handleError));
  }

  deleteFornecedor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/fornecedores/${id}`)
      .pipe(catchError(this.handleError));
  }

  getEmpresasFornecedor(id: number): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(`${this.baseUrl}/fornecedores/${id}/empresas`)
      .pipe(catchError(this.handleError));
  }

  validarCep(cep: string): Promise<any> {
    return firstValueFrom(this.http.get(`https://viacep.com.br/ws/${cep}/json/`));
  }

  vincularFornecedor(empresaId: number, fornecedorId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/empresas/${empresaId}/fornecedores/${fornecedorId}`, {})
      .pipe(catchError(this.handleError));
  }

  desvincularFornecedor(empresaId: number, fornecedorId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/empresas/${empresaId}/fornecedores/${fornecedorId}`)
      .pipe(catchError(this.handleError));
  }

  getFornecedoresEmpresa(empresaId: number): Observable<Fornecedor[]> {
    return this.http.get<Fornecedor[]>(`${this.baseUrl}/empresas/${empresaId}/fornecedores`)
      .pipe(catchError(this.handleError));
  }
}
