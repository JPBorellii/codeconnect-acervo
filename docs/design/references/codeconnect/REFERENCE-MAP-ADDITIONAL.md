# CodeConnect — Referências adicionais do Figma

Pacote complementar às referências já existentes no projeto.

## Como instalar

Extraia o conteúdo deste ZIP diretamente na raiz:

`C:\Users\borel\Documents\Projetos\alura-engenharia-ia`

A estrutura `docs/design/references/codeconnect` será mesclada à pasta existente.

## Novas referências

### Publicar
- `publish-mobile-360.png`
- `publish-tablet-768.png`
- `publish-desktop-1920.png`

Use na Fase 5E-C para implementar `/publicar`.

### Sobre nós
- `about-mobile.png`
- `about-tablet.png`
- `about-desktop-1920.png`

Guardar para a futura página `/sobre`.

### Detalhes — variante autenticada e rica
- `post-details-authenticated-mobile.png`
- `post-details-authenticated-tablet.png`
- `post-details-authenticated-desktop-1920.png`

Essas imagens mostram a variante autenticada, com código e comentários.
Elas complementam, mas não substituem, as referências públicas de detalhes
já versionadas no projeto.

### Fundamentos visuais
- `figma-style-guide.png`
- `figma-components-board.png`

O guia de estilos é a fonte visual para tipografia Prompt e paleta.
O board de componentes serve como mapa visual; não deve ser tratado como
uma tela de aplicação.

## Regras permanentes

- Não importar estas imagens na aplicação.
- Não copiar para `apps/web/public` ou `apps/web/src/assets`.
- Não usar como background ou conteúdo do produto.
- Consultar somente como referência visual durante implementação e revisão.
- Preferir dados reais da API; não inventar conteúdo para imitar screenshots.
- Validar desktop, tablet e mobile antes de commit.
- Preservar acessibilidade, responsividade e os contratos reais do backend.

## Observação sobre dimensões

Algumas exportações mobile/tablet têm largura física diferente do nome da
categoria. O arquivo `reference-manifest.json` registra as dimensões reais de
cada PNG para evitar suposições incorretas.
