# UAI — Unidade de Alerta de Incêndio

Frontend do sistema de monitoramento e prevenção de incêndios florestais no Norte de Minas Gerais.

## Stack

- React 19 + Vite
- Tailwind CSS (v3)
- React Router DOM
- React Leaflet + Leaflet + react-leaflet-cluster
- Recharts
- Lucide React
- Axios

## Telas

| Rota         | Tela                           | Status          |
|--------------|--------------------------------|-----------------|
| `/`          | Mapa público com indicadores   | Integrado à API |
| `/historico` | Histórico e gráficos           | Integrado à API |
| `/reportar`  | Formulário de denúncia         | Integrado à API |
| `/login`     | Login institucional            | Integrado à API |
| `/painel`    | Painel operacional (bombeiros) | Integrado à API |
| `/admin`     | Administração de usuários      | Integrado à API |

## Como rodar

### Opção 1 — Docker (frontend + backend juntos)

Requer Docker Compose >= 2.20.

```bash
# Na raiz do repositório zetta/
docker compose up --build
```

- Frontend: http://localhost:3000
- API: https://localhost:8000

> Na primeira execução, acesse `https://localhost:8000` no navegador e aceite
> o certificado autoassinado antes de usar o frontend.

Para parar:

```bash
docker compose down
```

### Opção 2 — Desenvolvimento local (hot reload)

**Pré-requisitos:** Node.js 20+, backend rodando em `https://localhost:8000`.

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env

# 3. Iniciar servidor de desenvolvimento
npm run dev
```

O servidor fica disponível em `http://localhost:5173`.

### Build e lint

```bash
npm run build   # Produção → dist/
npm run lint    # ESLint
npm run preview # Preview do build de produção
```

## Integração de Ciência de Dados

O código de integração com a API do time de Data Science (`fire-control-data-science-main`)
está isolado em `src/features/data-science/` e **não faz parte do bundle principal**.
Para ativá-lo, importe `DataScienceSection` de lá e defina `VITE_DS_API_URL` no `.env`.

## Variáveis de ambiente

| Variável          | Descrição                                    | Padrão                    |
|-------------------|----------------------------------------------|---------------------------|
| `VITE_API_URL`    | URL base da API REST (FastAPI)               | `https://localhost:8000`  |
| `VITE_DS_API_URL` | URL da API de Ciência de Dados (opcional)    | `http://localhost:8001`   |
