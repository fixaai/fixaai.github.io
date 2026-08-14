# Fixa aí

Repetição espaçada para fixar conteúdo das provas da faculdade.

Este diretório é o app publicado. Não edite nada aqui à mão — tudo é gerado
por `build.py` a partir de `shell.html` (o programa) e de `banco.js` + `micro.js`
(as questões).

- `index.html` — o programa
- `banco.json` — as questões (466 hoje)
- `sw.js` — o service worker: guarda o app para funcionar offline e busca
  questão nova toda vez que houver internet
- `manifest.webmanifest` — o que faz o app instalar na tela de início
- `icons/` — os ícones

## Publicar uma questão nova

Trocar o `banco.json` já basta. Quem tem o app instalado recebe a questão
na próxima vez que abrir com internet, sem baixar nada.
