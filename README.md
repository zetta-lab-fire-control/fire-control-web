# UAI — Unidade de Alerta de Incêndio

Sistema comunitário de monitoramento e prevenção de incêndios florestais no Norte de Minas Gerais. A comunidade reporta focos, o sistema agrupa alertas e facilita a resposta rápida de bombeiros e brigadistas.

---

## Funcionalidades

- **Mapa em tempo real** — focos agrupados por cluster, popups com intensidade, status e horário, filtros por período, cidade e intensidade
- **Denúncias georreferenciadas** — formulário com seleção no mapa, restrito à região do Norte de Minas Gerais
- **Histórico com gráficos** — evolução de ocorrências por período (hoje, 30, 60, 90 dias, último ano)
- **Painel operacional** — bombeiros visualizam e gerenciam ocorrências em tempo real
- **Painel administrativo** — gestão de usuários e criação de contas de bombeiros
- **Autenticação JWT** — controle de acesso por perfil: usuário, bombeiro e admin

---

## Telas

| Rota         | Descrição                      |
|--------------|--------------------------------|
| `/`          | Mapa público com indicadores   |
| `/historico` | Histórico e gráficos           |
| `/reportar`  | Formulário de denúncia         |
| `/login`     | Login institucional            |
| `/painel`    | Painel operacional (bombeiros) |
| `/admin`     | Administração de usuários      |

---

## Como rodar

### Pré-requisito

`fire-control-api/` precisa estar na mesma pasta pai que `fire-control-web/`:

```
pasta-pai/
├── fire-control-web/   ← este repositório
└── fire-control-api/
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

### Desenvolvimento local

**Pré-requisitos:** Node.js 20+, backend rodando em `https://localhost:8000`.

```bash
npm install
cp .env.example .env
npm run dev        # http://localhost:5173
```

```bash
npm run build      # Build de produção → dist/
npm run lint       # ESLint
npm run preview    # Preview do build
```

---

## Stack

React 19 · Vite 8 · Tailwind CSS 3 · React Leaflet · Recharts · Axios · Lucide React

---

## Variáveis de ambiente

| Variável          | Descrição                                          |
|-------------------|----------------------------------------------------|
| `VITE_API_URL`    | URL base da API REST (padrão: `/api` via proxy)    |
| `VITE_DS_API_URL` | URL da API de Ciência de Dados (opcional)          |

> A integração com a API de Ciência de Dados está isolada em `src/features/data-science/` e não faz parte do bundle principal.
