# Sistema de Gestão de Empresas e Fornecedores

Sistema full-stack para gerenciamento de empresas e seus fornecedores, desenvolvido como parte de um desafio técnico.

## Tecnologias Utilizadas

### Frontend
- Angular 14
- PrimeNG
- TypeScript

## Funcionalidades

### Empresas
- CRUD completo de empresas
- Validação de CNPJ único
- Validação de CEP via API externa

### Fornecedores
- CRUD completo de fornecedores
- Validação de CPF/CNPJ único
- Validação de CEP via API externa
- Suporte a pessoa física e jurídica
- Validações específicas para fornecedores pessoa física:
  - RG obrigatório
  - Data de nascimento obrigatória
  - Restrição de idade para empresas do Paraná

### Relacionamentos
- Empresas podem ter múltiplos fornecedores
- Fornecedores podem trabalhar para múltiplas empresas

## Pré-requisitos
- Node.js

## Configuração do Ambiente

1. Clone o repositório do frontend:
```bash
git clone https://github.com/seu-usuario/fornecedor-front.git
```

2. Navegue até o diretório do projeto:
```bash
cd fornecedor-front
```

3. Instale as dependências:
```bash
npm install
```

4. Inicie o servidor de desenvolvimento:
```bash
npm start
```

A aplicação frontend estará disponível em `http://localhost:4200/`

## Próximos Passos
- Implementação de autenticação e autorização
- Melhorias na interface do usuário
