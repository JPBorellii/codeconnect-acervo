# Plano de implementação — página de login CodeConnect

## 1. Objetivo e limites

Implementar em `apps/web` uma página de login em React e TypeScript com alta
fidelidade à referência `design-references/login-page-reference.png`, mantendo:

- fundo escuro com padrões decorativos de elos;
- card central de autenticação;
- banner vertical à esquerda no desktop;
- formulário à direita;
- campos de email/usuário e senha;
- opção “Lembrar-me”;
- texto “Esqueci a senha”;
- botão principal;
- divisor e botões sociais;
- chamada visual para criação de cadastro.

A execução aprovada deste plano deverá:

- manter `apps/api` intocado;
- não implementar autenticação real, recuperação de senha ou OAuth;
- não implementar a página de cadastro;
- não criar links para rotas inexistentes;
- não executar `git add`, `git commit` ou `git push`;
- não instalar dependências além das listadas neste plano;
- só remover arquivos do scaffold após autorização explícita para executar a
  implementação.

## 2. Estado atual considerado

O frontend é um scaffold mínimo do Vite com:

- React 19;
- TypeScript;
- Vite;
- Oxlint;
- nenhuma configuração de Tailwind;
- nenhum roteador;
- nenhuma infraestrutura de testes;
- apenas `App.tsx`, `App.css`, `index.css`, `main.tsx` e assets demonstrativos
  dentro de `src`.

Serão utilizados sem alteração:

- `apps/web/public/banner-login.png`;
- `apps/web/public/github.png`;
- `apps/web/public/gmail.png`.

A referência visual tem 3840 × 2600 px. A implementação usará suas proporções,
hierarquia e paleta como base, sem transformar essas dimensões em alturas fixas
que prejudiquem telas menores.

## 3. Dependências a adicionar na execução

### 3.1 Dependência de produção

- `react-router`
  - Configurará as rotas `/` e `/login`.
  - Permitirá expansão futura para cadastro e outros fluxos sem trocar a base
    de navegação.
  - Será usado no modo declarativo atual com `BrowserRouter`, `Routes`, `Route`
    e `Navigate`.
  - `react-router-dom` não será instalado. A documentação atual recomenda
    `react-router` para o modo declarativo, e o pacote DOM de compatibilidade não
    é necessário para esta aplicação.

Referências:

- https://reactrouter.com/start/declarative/installation
- https://reactrouter.com/start/declarative/routing

### 3.2 Dependências de desenvolvimento para Tailwind CSS v4

- `tailwindcss`;
- `@tailwindcss/vite`.

A integração seguirá a configuração oficial do Tailwind CSS v4 para Vite:

- plugin `tailwindcss()` em `vite.config.ts`;
- `@import "tailwindcss";` no CSS principal;
- configuração de tokens pelo modelo CSS-first;
- nenhum `postcss.config.*`;
- nenhum `tailwind.config.*` enquanto não houver necessidade concreta.

Referência:

- https://tailwindcss.com/docs/installation/using-vite

### 3.3 Dependências de desenvolvimento para testes

- `vitest`;
- `jsdom`;
- `@testing-library/react`;
- `@testing-library/dom`;
- `@testing-library/jest-dom`;
- `@testing-library/user-event`.

Essas dependências serão instaladas junto com a implementação. Os testes
essenciais co-localizados também serão criados na mesma execução; não ficarão
para uma fase posterior.

Não será estabelecida meta de 100% de cobertura. A prioridade será o
comportamento crítico e a acessibilidade essencial.

### 3.4 Tipografia

Nenhum pacote de fonte será instalado por inferência visual.

A identificação exata da família tipográfica permanecerá pendente de
confirmação no Figma. Até essa confirmação será usada uma pilha compatível e
local, por exemplo:

```css
font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
  "Segoe UI", sans-serif;
```

Se o Figma confirmar uma fonte não disponível localmente, a forma de
distribuição será decidida em uma alteração separada.

## 4. Arquivos atuais que serão modificados

Após autorização para executar a implementação:

### `package.json`

- adicionar `web:test`, apontando para o script de teste do workspace web;
- opcionalmente adicionar `web:test:watch`, mantendo o padrão dos scripts raiz.

### `apps/web/package.json`

- registrar `react-router`;
- registrar Tailwind e dependências de testes;
- adicionar:
  - `test`: execução única do Vitest;
  - `test:watch`: Vitest em modo watch.

### `pnpm-lock.yaml`

- atualizar somente como consequência da instalação autorizada das
  dependências declaradas.

### `apps/web/vite.config.ts`

- preservar o plugin React;
- importar `@tailwindcss/vite`;
- adicionar `tailwindcss()` à lista de plugins.

### `apps/web/index.html`

- alterar `lang="en"` para `lang="pt-BR"`;
- atualizar o título para `CodeConnect | Login`;
- adicionar uma descrição curta da página.

### `apps/web/src/main.tsx`

- manter `StrictMode`;
- manter a importação do CSS principal;
- envolver a aplicação em `BrowserRouter`.

### `apps/web/src/App.tsx`

- remover a demonstração do Vite;
- renderizar `AppRoutes`.

### `apps/web/src/index.css`

- substituir os estilos do scaffold;
- adicionar `@import "tailwindcss";`;
- definir tokens visuais e a pilha tipográfica provisória;
- manter somente estilos globais essenciais para `html`, `body` e `#root`.

## 5. Arquivos que serão criados

```text
apps/web/
├── vitest.config.ts
└── src/
    ├── components/
    │   ├── atoms/
    │   │   ├── Button.tsx
    │   │   ├── Button.test.tsx
    │   │   ├── Checkbox.tsx
    │   │   ├── Checkbox.test.tsx
    │   │   ├── TextInput.tsx
    │   │   ├── TextInput.test.tsx
    │   │   ├── TextLink.tsx
    │   │   └── TextLink.test.tsx
    │   ├── molecules/
    │   │   ├── AuthPrompt.tsx
    │   │   ├── AuthPrompt.test.tsx
    │   │   ├── FormField.tsx
    │   │   ├── FormField.test.tsx
    │   │   ├── SectionDivider.tsx
    │   │   ├── SectionDivider.test.tsx
    │   │   ├── SocialLoginButton.tsx
    │   │   └── SocialLoginButton.test.tsx
    │   ├── organisms/
    │   │   ├── LoginForm.tsx
    │   │   ├── LoginForm.test.tsx
    │   │   ├── SocialLoginOptions.tsx
    │   │   └── SocialLoginOptions.test.tsx
    │   ├── templates/
    │   │   ├── AuthTemplate.tsx
    │   │   └── AuthTemplate.test.tsx
    │   └── pages/
    │       ├── LoginPage.tsx
    │       └── LoginPage.test.tsx
    ├── routes/
    │   ├── AppRoutes.tsx
    │   └── AppRoutes.test.tsx
    └── test/
        └── setup.ts
```

O banner e os padrões decorativos permanecerão dentro de `AuthTemplate` nesta
primeira implementação. Eles só serão extraídos se surgir reutilização real que
justifique novos componentes.

## 6. Arquivos do scaffold candidatos a remoção

Somente durante a futura execução aprovada, depois de confirmar que não possuem
mais importações:

- `apps/web/src/App.css`;
- `apps/web/src/assets/react.svg`;
- `apps/web/src/assets/vite.svg`;
- `apps/web/src/assets/hero.png`.

A pasta `src/assets` só será removida se estiver vazia. Nenhuma remoção faz parte
da etapa de criação deste plano.

## 7. Estrutura Atomic Design e responsabilidades

### 7.1 Atoms

#### `Button`

- botão semântico reutilizável;
- variantes visualmente controladas para ação principal e social;
- suporte a `type`, `disabled`, ícone opcional e propriedades nativas;
- foco visível consistente;
- não conhece formulário, autenticação ou provedor social.

#### `Checkbox`

- encapsula o checkbox nativo e seu estilo visual;
- preserva ativação por clique e tecla Espaço;
- encaminha `id`, `name`, `checked`, `defaultChecked` e propriedades ARIA.

#### `TextInput`

- campo base para texto, email e senha;
- encaminha propriedades nativas, incluindo `required`, `autoComplete`,
  `aria-invalid` e `aria-describedby`;
- centraliza estilos de foco, erro e estado desabilitado.

#### `TextLink`

- link interno padronizado usando o `Link` do `react-router`;
- usado somente quando houver uma rota válida;
- nunca recebe `href="#"`;
- mantém foco visível e nome acessível.

### 7.2 Molecules

#### `FormField`

- combina label visível, `TextInput`, texto auxiliar e mensagem de erro;
- garante associação entre `label`, `input` e mensagem por `htmlFor`, `id` e
  `aria-describedby`;
- poderá ser reutilizado pelo futuro formulário de cadastro.

#### `AuthPrompt`

- exibe texto introdutório e uma chamada em destaque;
- aceita um destino opcional;
- usa `TextLink` somente quando existir uma rota válida;
- sem destino, renderiza a chamada como texto enfatizado e não como controle
  interativo, evitando link quebrado ou ação enganosa.

No login, “Crie seu cadastro!” será exibido visualmente, mas não navegará até a
rota de cadastro existir.

#### `SectionDivider`

- exibe “ou entre com outras contas” entre linhas decorativas;
- mantém o texto disponível para tecnologias assistivas;
- oculta apenas as linhas da árvore de acessibilidade.

#### `SocialLoginButton`

- combina `Button`, ícone PNG e texto do provedor;
- usa ícone com `alt=""`, pois “GitHub” ou “Google” já fornece o nome acessível;
- usa `type="button"` para não submeter o formulário;
- aceita callback e estado desabilitado;
- não contém lógica OAuth.

### 7.3 Organisms

#### `LoginForm`

- contém título, boas-vindas e o `<form>`;
- usa dois `FormField`;
- inclui “Lembrar-me”, texto de recuperação de senha e submit;
- recebe `onSubmit` e estado de envio por propriedades;
- valida campos obrigatórios sem realizar requisição;
- entrega os dados normalizados ao callback da página.

Como ainda não há rota ou fluxo de recuperação, “Esqueci a senha” será exibido
com o mesmo destaque visual da referência, mas sem fingir navegação ou ação.
Quando o fluxo existir, poderá usar `TextLink` sem alterar a estrutura do
formulário.

#### `SocialLoginOptions`

- combina `SectionDivider` e os botões GitHub/Google;
- recebe callbacks opcionais por provedor;
- não conhece endpoints nem tokens;
- quando não houver integração, os controles serão apresentados de forma
  semanticamente indisponível, sem iniciar OAuth fictício.

### 7.4 Template

#### `AuthTemplate`

- define `<main>`, fundo, card, banner e painel de conteúdo;
- mantém `/banner-login.png` como propriedade da variante de login, não como
  regra fixa do layout;
- contém inicialmente os SVGs/CSS dos padrões de elos;
- recebe o conteúdo do painel por `children`;
- não conhece rotas, credenciais, callbacks ou dados de autenticação;
- será reutilizado pela futura página de cadastro com outro banner e outro
  organismo de formulário.

### 7.5 Page

#### `LoginPage`

- compõe `AuthTemplate`, `LoginForm`, `SocialLoginOptions` e `AuthPrompt`;
- fornece textos e asset específicos do login;
- recebe a submissão do formulário sem fazer chamada de rede;
- mantém os provedores sociais sem OAuth;
- exibe a chamada de cadastro sem criar rota inexistente.

## 8. Reutilização futura entre login e cadastro

A futura `RegisterPage` deverá reutilizar:

- `AuthTemplate`;
- `FormField`;
- `TextInput`;
- `Button`;
- `SocialLoginOptions`;
- `AuthPrompt`.

Ela fornecerá:

- outro banner;
- outro título e texto introdutório;
- um futuro `RegisterForm` com seus campos e validações;
- uma chamada válida de retorno para `/login`.

`AuthTemplate` não terá condicionais como `mode="login" | "register"`. Banner e
conteúdo serão passados como propriedades/slots, mantendo o template genérico e
sem dependência de dados reais.

## 9. Estratégia visual

### 9.1 Paleta inicial

Os valores serão refinados pela comparação no navegador:

- fundo da página: próximo de `#00090E`;
- superfície do card: próximo de `#171D1F`;
- campo: cinza próximo de `#888888`;
- texto principal: próximo de `#E1E1E1`;
- texto secundário: cinza claro;
- destaque: verde próximo de `#81FE88`;
- texto sobre o verde: azul-petróleo escuro;
- padrões decorativos: tom entre fundo e card, com baixo contraste.

Esses valores serão registrados como tokens CSS no `@theme` do Tailwind v4.

### 9.2 Composição

- página com `min-height: 100dvh`;
- card central com largura máxima e cantos arredondados;
- banner sem deformação, usando `object-fit: cover`;
- formulário com largura confortável e ritmo vertical equivalente à referência;
- botão principal ocupando toda a largura do formulário;
- padrões decorativos parcialmente cortados nas extremidades do viewport;
- ausência de alturas rígidas no conteúdo, permitindo rolagem em telas baixas.

### 9.3 Assets

- banner: `/banner-login.png`;
- GitHub: `/github.png`;
- Google: `/gmail.png`.

O texto do segundo provedor será “Google”, apesar do nome do arquivo e da
legenda “Gmail” na referência, seguindo o requisito funcional aprovado.

Os caminhos deverão respeitar `import.meta.env.BASE_URL` caso o projeto seja
publicado abaixo de um subcaminho.

## 10. Configuração do Tailwind CSS v4

### `vite.config.ts`

- preservar `react()`;
- importar `tailwindcss` de `@tailwindcss/vite`;
- registrar `tailwindcss()` nos plugins.

### `index.css`

- iniciar com `@import "tailwindcss";`;
- usar `@theme` para cores, fonte e outros tokens reutilizáveis;
- usar `@layer base` apenas para:
  - box sizing, se necessário;
  - corpo sem margem;
  - fundo e cor base;
  - altura mínima de `#root`;
  - pilha tipográfica provisória.

O restante do estilo ficará nas classes utilitárias dos componentes. Não será
criado um novo CSS global por componente.

## 11. Estratégia de rotas

Rotas da primeira implementação:

- `/` → `<Navigate to="/login" replace />`;
- `/login` → `LoginPage`.

Não serão configuradas nesta etapa:

- `/cadastro`;
- recuperação de senha;
- callbacks OAuth;
- área autenticada.

A chamada de cadastro permanecerá como texto visualmente destacado, não
focável, até existir um destino real. O mesmo princípio será aplicado a qualquer
fluxo ainda indisponível: não usar link quebrado, `href="#"` ou botão sem
comportamento.

`BrowserRouter` exige que o ambiente de hospedagem redirecione acessos diretos
para `index.html`. Essa configuração será confirmada antes do deploy; não exige
mudança no backend nesta implementação.

## 12. Comportamento responsivo

### 1920 × 1300

- principal referência de comparação visual;
- card central em duas colunas;
- banner vertical completo à esquerda;
- formulário à direita;
- padrões decorativos grandes nos cantos;
- espaçamentos e proporções calibrados contra a referência.

### 1024 × 768

- manter duas colunas apenas se banner e formulário continuarem legíveis;
- reduzir paddings e gaps;
- permitir rolagem vertical em vez de comprimir controles;
- ajustar o recorte do banner para preservar pessoa e marca.

### 768 × 1024

- empilhar banner e painel;
- converter o banner em faixa superior com altura limitada;
- usar `object-position` específico para manter o assunto principal;
- formulário abaixo com largura integral dentro do card;
- reduzir padrões decorativos sem removê-los completamente.

### 390 × 844

- card em uma coluna com margem lateral segura;
- banner compacto no topo;
- painel com padding reduzido;
- botão principal em largura total;
- linha “Lembrar-me / Esqueci a senha” capaz de quebrar sem sobreposição;
- botões sociais lado a lado quando houver espaço, ou empilhados;
- nenhum overflow horizontal;
- rolagem vertical natural para conteúdo e teclado virtual.

Os breakpoints finais serão escolhidos pelo comportamento do conteúdo, não
apenas pelo nome do dispositivo.

## 13. Acessibilidade

- `lang="pt-BR"` no documento;
- um único `<main>`;
- hierarquia coerente de títulos;
- `<form>` semântico;
- botão principal com `type="submit"`;
- botões sociais com `type="button"`;
- labels visíveis e associadas aos inputs;
- campos com `name`, `required` e `autoComplete` adequados:
  - `username`;
  - `current-password`;
- checkbox nativo associado ao texto “Lembrar-me”;
- mensagens de erro associadas por `aria-describedby`;
- `aria-invalid` somente quando houver erro;
- foco enviado ao primeiro campo inválido após tentativa de submissão;
- foco visível de alto contraste;
- ordem de tabulação correspondente à ordem visual;
- ícones sociais decorativos com `alt=""`;
- banner com alternativa curta e útil;
- padrões de fundo com `aria-hidden="true"` e `pointer-events: none`;
- nenhum controle falso para cadastro, recuperação de senha ou OAuth;
- contraste validado para WCAG AA;
- funcionamento com zoom de 200%;
- erros comunicados por texto, não somente por cor.

## 14. Testes co-localizados

Os testes serão entregues junto com os componentes, mas sem buscar 100% de
cobertura.

### Prioridades obrigatórias

1. Associação entre labels e inputs.
2. Presença e comportamento de campos obrigatórios.
3. Marcação e desmarcação de “Lembrar-me”.
4. Envio do formulário com os valores informados.
5. Botões sociais e seus callbacks quando habilitados.
6. Renderização de `/login`.
7. Acessibilidade essencial por roles, nomes e atributos.

### Cobertura por camada

#### Atoms

- `Button.test.tsx`
  - tipo e nome acessível;
  - clique;
  - estado desabilitado.

- `Checkbox.test.tsx`
  - propriedades nativas;
  - alternância pelo usuário.

- `TextInput.test.tsx`
  - encaminhamento de `required`, `autoComplete` e atributos ARIA.

- `TextLink.test.tsx`
  - destino válido dentro de `MemoryRouter`;
  - nome acessível;
  - ausência de `href="#"`.

#### Molecules

- `FormField.test.tsx`
  - label associado ao input;
  - erro associado por `aria-describedby`;
  - `aria-invalid`.

- `AuthPrompt.test.tsx`
  - chamada sem destino renderizada como texto, não como link;
  - link válido quando um destino real é fornecido.

- `SectionDivider.test.tsx`
  - texto acessível;
  - linhas decorativas ignoradas.

- `SocialLoginButton.test.tsx`
  - nome do provedor;
  - `type="button"`;
  - acionamento e estado desabilitado.

#### Organisms

- `LoginForm.test.tsx`
  - labels “Email ou usuário” e “Senha”;
  - ambos os campos obrigatórios;
  - autocomplete correto;
  - alternância do checkbox;
  - prevenção de envio inválido;
  - envio de email/usuário, senha e `rememberMe`;
  - foco no primeiro campo inválido.

- `SocialLoginOptions.test.tsx`
  - presença de GitHub e Google;
  - callbacks independentes;
  - ausência de submissão do formulário.

#### Template e page

- `AuthTemplate.test.tsx`
  - renderização do banner e do conteúdo;
  - alternativa do banner;
  - padrões decorativos ocultos da árvore acessível.

- `LoginPage.test.tsx`
  - título e boas-vindas;
  - formulário completo;
  - chamada de cadastro visível e não navegável;
  - ausência de chamadas reais de autenticação ou OAuth.

- `AppRoutes.test.tsx`
  - `/login` renderiza `LoginPage`;
  - `/` redireciona para `/login`.

### Configuração

`vitest.config.ts` usará:

- ambiente `jsdom`;
- `setupFiles: ['./src/test/setup.ts']`;
- integração com a transformação do Vite.

`src/test/setup.ts` importará:

```ts
import '@testing-library/jest-dom/vitest'
```

Os testes usarão queries por papel, label e nome acessível. Seletores por classe
CSS ou detalhes internos serão evitados.

## 15. Ordem de implementação

1. Instalar somente as dependências aprovadas no workspace `web`.
2. Configurar Tailwind v4 e Vitest.
3. Substituir os estilos globais do scaffold por tokens e base da aplicação.
4. Implementar atoms e seus testes.
5. Implementar molecules e seus testes.
6. Implementar `LoginForm` e `SocialLoginOptions` com testes.
7. Implementar `AuthTemplate`, mantendo banner e padrões dentro dele.
8. Implementar `LoginPage`.
9. Configurar `/` e `/login`.
10. Remover arquivos do scaffold somente após confirmar que não possuem mais
    referências e se houver autorização para a execução.
11. Executar as validações finais.

## 16. Validações finais

Na futura execução:

1. `pnpm.cmd web:lint`
2. `pnpm.cmd web:test`
3. `pnpm.cmd web:build`
4. iniciar `pnpm.cmd web:dev`
5. verificar visualmente:
   - 1920 × 1300;
   - 1024 × 768;
   - 768 × 1024;
   - 390 × 844.
6. comparar card, banner, recorte, espaçamentos, tipografia, cores e padrões com
   a referência;
7. testar toda a sequência com teclado;
8. testar zoom de 200%;
9. confirmar ausência de overflow horizontal;
10. verificar console e árvore de acessibilidade;
11. repetir lint, testes e build após ajustes finais.

## 17. Riscos e decisões pendentes

- A tipografia exata depende de confirmação no Figma. Nenhuma fonte será
  instalada antes disso.
- A referência mostra “Gmail”, mas a interface usará “Google”, conforme o
  requisito aprovado.
- A referência mostra credenciais preenchidas; a implementação iniciará com
  campos vazios e autocomplete correto.
- Cadastro e recuperação de senha permanecerão visualmente representados, mas
  sem controles navegáveis até existirem destinos reais.
- Os botões sociais não poderão iniciar OAuth sem endpoints e contratos; sua
  integração ficará isolada em callbacks futuros.
- O submit validará e entregará dados ao callback, mas não simulará autenticação
  bem-sucedida.
- A referência é essencialmente desktop; os layouts de tablet e celular serão
  adaptações baseadas na hierarquia visual e na acessibilidade.
- O recorte do banner poderá exigir `object-position` diferente por breakpoint.
- `BrowserRouter` dependerá de fallback para `index.html` no ambiente de
  hospedagem.
- Tailwind CSS v4 exige navegadores modernos; a matriz de suporte deverá ser
  confirmada antes de produção.
