import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmpresaFornecedorComponent } from './components/empresa-fornecedor/empresa-fornecedor.component';

const routes: Routes = [
  { path: 'empresas/fornecedores', component: EmpresaFornecedorComponent },
  { path: '', redirectTo: 'empresas/fornecedores', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
