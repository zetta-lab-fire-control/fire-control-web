# UAI — Alerta de Unidade de Incêndio

Frontend do projeto integrador focado em monitoramento e prevenção de incêndios florestais no Norte de Minas Gerais.

## Stack

- React + Vite
- Tailwind CSS (v3)
- React Router DOM
- React Leaflet + Leaflet + react-leaflet-cluster
- Recharts
- Lucide React
- Axios

## Etapa atual

Integração com a API REST (FastAPI). O frontend consome endpoints reais com fallback para dados mockados quando a API está indisponível.

### Telas implementadas

| Rota         | Tela                          | Status              |
|--------------|-------------------------------|---------------------|
| `/`          | Mapa público com indicadores  | Integrado à API     |
| `/historico` | Histórico e gráficos          | Integrado à API     |
| `/reportar`  | Formulário de denúncia        | Integrado à API     |
| `/login`     | Login de bombeiros            | Integrado à API     |
| `/painel`    | Painel operacional (dashboard)| Integrado à API     |

## Como rodar

### Pré-requisitos

- Node.js 18+
- Backend (`fire-control-api`) rodando em `https://localhost:8000`

### Configuração

```bash
# 1. Instalar dependências
npm install

# 2. Criar o arquivo de variáveis de ambiente (edite se necessário)
cp .env.example .env
```

> ⚠️ O backend usa certificado SSL autoassinado em desenvolvimento.
> Acesse `https://localhost:8000/docs` uma vez no navegador e aceite o certificado
> antes de usar o frontend, caso contrário as requisições serão bloqueadas.

### Execução

```bash
npm run dev
```

### Build e qualidade

```bash
npm run lint
npm run build
```

## Pendências de integração

- [ ] Autenticação real com JWT (o backend ainda retorna `true` no login)
- [ ] Substituir UUID fixo de usuário anônimo pelo ID do usuário autenticado
- [ ] Proteção de rota `/painel` (redirecionar se não autenticado)
- [ ] Upload de foto via MinIO validado end-to-end com backend rodando
