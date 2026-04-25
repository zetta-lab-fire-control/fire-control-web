# UAI — Unidade de Alerta de Incêndio

Sistema comunitário de monitoramento e prevenção de incêndios florestais no Norte de Minas Gerais. A comunidade reporta focos, o sistema agrupa alertas por proximidade (raio de 400 m) e facilita a resposta rápida de bombeiros e brigadistas.

---

## Funcionalidades

- **Mapa em tempo real** — focos agrupados por cluster, popups com intensidade, status e horário, filtros por período, cidade e intensidade
- **Denúncias georreferenciadas** — formulário com seleção no mapa, restrito à região do Norte de Minas Gerais
- **Histórico com gráficos** — evolução de ocorrências por período (hoje, 30, 60, 90 dias, último ano)
- **Análise preditiva** — explorador de dados históricos INPE + simulador de risco com modelos LightGBM
- **Painel operacional** — bombeiros visualizam e gerenciam ocorrências em tempo real
- **Painel administrativo** — gestão de usuários e criação de contas de bombeiros
- **Autenticação JWT** — controle de acesso por perfil: usuário, bombeiro e admin

---

## Telas

| Rota         | Acesso      | Descrição                                       |
|--------------|-------------|-------------------------------------------------|
| `/`          | Público     | Mapa público com indicadores de risco           |
| `/historico` | Público     | Histórico e gráficos de ocorrências             |
| `/analise`   | Público     | Análise preditiva com modelos de ML (DS)        |
| `/reportar`  | Login       | Formulário de denúncia georreferenciada         |
| `/login`     | Público     | Login institucional                             |
| `/cadastro`  | Público     | Cadastro de usuário comum                       |
| `/painel`    | Bombeiro+   | Painel operacional de ocorrências               |
| `/admin`     | Admin       | Administração de usuários                       |

---

## Como rodar

### Pré-requisito

`fire-control-api/` e (opcional) `fire-control-data-science-main/` precisam estar na mesma pasta pai:

```
zetta/
├── fire-control-web/          ← este repositório
├── fire-control-api/          ← backend obrigatório
└── fire-control-data-science-main/  ← opcional (página /analise)
```

### Desenvolvimento local

**Pré-requisitos:** Node.js 20+, `fire-control-api` rodando em `https://127.0.0.1:8000`.

```bash
npm install
cp .env.example .env    # ajuste as URLs se necessário
npm run dev             # http://localhost:5173
```

```bash
npm run build      # Build de produção → dist/
npm run lint       # ESLint
npm run preview    # Preview do build
```

### Docker — recomendado

Sobe frontend e backend juntos. Requer Docker Compose >= 2.20.

```bash
docker compose up --build
```

| Serviço  | URL                    |
|----------|------------------------|
| Frontend | http://localhost:3000  |
| API      | https://localhost:8000 |

```bash
docker compose down       # Para tudo
docker compose down -v    # Para tudo e apaga os dados
```

---

## Integração com a API de Ciência de Dados

A página `/analise` consome diretamente a API do serviço `fire-control-data-science-main` (porta 8001 por padrão). Para ativá-la:

1. Suba o serviço DS (ver instruções no `fire-control-data-science-main/README.md`)
2. Verifique que `VITE_DS_API_URL=http://localhost:8001` está no `.env`
3. Acesse `/analise` no frontend

A página exibe:
- Visão geral do dataset INPE/QUEIMADAS (registros, período, biomas, estados)
- Explorador de focos históricos com filtros + gráfico de distribuição de predições
- Simulador de risco por município do Norte de MG (modelo LightGBM em tempo real)
- Lista dos modelos treinados com metadados

Se o serviço DS não estiver acessível, a página exibe um aviso e não quebra o restante do sistema.

---

## Stack

React 19 · Vite 8 · Tailwind CSS 3 · React Leaflet · Recharts · Axios · Lucide React

---

## Variáveis de ambiente

| Variável             | Padrão                  | Descrição                                     |
|----------------------|-------------------------|-----------------------------------------------|
| `VITE_API_URL`       | `/api`                  | URL base da API REST (usa proxy Vite em dev)  |
| `VITE_PROXY_TARGET`  | `https://127.0.0.1:8000`| Destino do proxy Vite (backend Nginx/FastAPI) |
| `VITE_DS_API_URL`    | `http://localhost:8001` | URL da API de Ciência de Dados                |
