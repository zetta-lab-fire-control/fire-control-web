# UAI - Alerta de Unidade de Incendio

Frontend do projeto integrador focado em monitoramento e prevencao de incendios.

## Stack usada

- React + Vite
- Tailwind CSS (v3)
- React Router DOM
- React Leaflet + Leaflet
- Recharts
- Lucide React
- Axios (ainda nao integrado a API nesta etapa)

## Etapa atual

Esta primeira etapa contem apenas o frontend visual com dados mockados.

### Telas prontas

- Mapa (home)
- Historico
- Reportar foco
- Login bombeiros
- Painel operacional

## Como rodar

1. Instalar dependencias

```bash
npm install
```

2. Rodar em desenvolvimento

```bash
npm run dev
```

3. Validar qualidade e build

```bash
npm run lint
npm run build
```

## Proximas etapas

1. Integrar frontend com a API (axios + endpoints reais)
2. Implementar autenticacao real
3. Tratar status de ocorrencias e atualizacao de painel
4. Preparar deploy com Docker + Nginx
