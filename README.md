# ppi2024

Um fórum para a discussão de tudo relacionado a desenvolvimento de software

*Marcos Araújo Silva*
*Germano Barbosa da Silva Júnior*

Este fórum contém quatro entidades, usuário, sub-forums, tópicos e mensagens

Os sub-forums englobam um domínio na programação como linux ou javascript,
eles tem vários tópicos que são conversas dentro daquele domínio como uma dúvida,
e cada tópico contém várias mensagens

Os usuários podem se cadastrar e logar, sessões são rastreadas com cookies e cada usuário pode ter apenas uma sessão por vez

## Instalação

execute `npm install` para baixar os pacotes

execute `npm run reset` para criar o banco com dados de teste

## Execução

execute `npm start` para rodar o servidor

também é possível rodar `npm run watch` para rodar o servidor e automaticamente reiniciar quando você salvar mudanças no código

## Debugar

depois de baixar os pacotes e criar o banco, você pode executar debugando entrando no vscode e apertando F5

basta salvar as mudanças e o servidor será reiniciado

você também pode debugar os testes, vá na aba de debug do vscode (Ctrl+Shift+D) e escolha `Test` ao invés de `Launch`, e aperte F5

## Testando

você pode executar os testes com `npm test`, os testes estão em `scripts/test.ts`

## Visão geral

`src/main.ts` - arquivo principal, puxa as apis da pasta `api/`, configura e roda o servidor

`src/config.ts` - onde as constantes do servidor são guardadas

`src/database.ts` - acesso ao banco de dados, conecta sozinho no primeiro uso, e expõe o banco com as funções `query`, `fetch` e `execute`

`src/config.ts` - porta tcp e caminho do banco de dados

`src/utils.ts` - funções avulsas

`src/api/auth.ts` - apis que gerenciam as sessões dos usuarios

`src/api/subForum.ts` - apis rest que servem os sub-forums

`src/api/topicos.ts` - apis rest que servem os tópicos

`src/api/mensagem.ts` - apis rest que servem os mensagem

`src/api/busca.ts` - api que faz busca por termos nas mensagens

`scripts/reset.ts` - executado com `npm run reset`, apaga e recria o banco, aqui se encontra os comandos que criam a estrutura do banco
