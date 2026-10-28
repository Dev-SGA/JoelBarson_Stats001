# Joel Barson — Stats de Jogo

App Next.js (Vercel) para exibir estatísticas individuais de **Joel Barson** (FC Cincinnati) por jogo (sessão **002**: Club Ohio e St. Louis City), com visão **Season**. Na Season, a chave **Total / Per game** troca os números absolutos entre os totais e a média por jogo (as porcentagens não mudam); o PDF segue o modo escolhido.

Estrutura e visual alinhados ao app de stats da SGA (tema escuro, marca SGA Performance).

## Desenvolvimento

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Dados

Edite `data/gameStats.json` para atualizar números e links de vídeo (Breakline Passes e Ground Duels).

## Deploy

Conecte o repositório na Vercel; o `vercel.json` já define o framework Next.js.
