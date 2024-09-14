# ppi2024

Um fórum para a discussão de tudo relacionado a desenvolvimento de software

## Instalando

execute `npm install` para baixar os pacotes

execute `npm run reset` para criar o banco

execute `npm start` para rodar o servidor

depois destas etapas, basta rodar `npm start` de novo

## Debugar

depois de baixar os pacotes e criar o banco, você pode executar debugando entrando no vscode e apertando F5

basta salvar as mudanças e o servidor será reiniciado

você também pode debugar os testes, vá na aba de debug do vscode (Ctrl+Shift+D) e escolha `Test` ao invés de `Launch`, e aperte F5

## Testando

você pode executar os testes com `npm test`, os testes estão em `scripts/test.ts`

## Visão geral (pasta src)

`main.ts` - arquivo principal, puxa o `server.ts` e roda o servidor

`server.ts` - configura o app do express, puxa as apis dos arquivos na pasta `api/`

`database.ts` - acesso ao banco de dados, é conectado no primeiro uso, e expõe o banco com funções globais

`config.ts` - porta tcp e caminho do banco de dados

`utils.ts` - funções avulsas

`api/subForum.ts` - apis rest que servem os sub-forums

## Visão geral (pasta scripts)

`scripts/reset.ts` - executado com `npm run reset`, apaga e recria o banco, aqui se encontra a estrutura do banco

`scripts/test.ts` - executado com `npm test`, também apaga e recria o banco, roda um servidor local e faz vários testes
