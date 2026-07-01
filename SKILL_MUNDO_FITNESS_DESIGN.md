---
name: MundoFitnessDesignSystem
description: Identidade visual, tokens de design e especificações de componentes baseados na tela de referência para o projeto MundoFitness.
---

# 🎨 Guia de Estilo e Identidade Visual — MundoFitness

Este documento serve como o **Guia de Estilo (Design System) e Manual de Skill Local** para o desenvolvimento do projeto MundoFitness. Qualquer nova tela, componente ou elemento de UI deve seguir rigorosamente as regras, cores, tipografia e padrões de layout aqui descritos.

---

## 🏛️ Diretrizes de Layout e Grid

O layout baseia-se em uma interface de **Dashboard Administrativo moderno de alta fidelidade (SaaS Premium)**, utilizando uma estrutura de duas colunas principais com uma barra de navegação lateral (Sidebar) e área de conteúdo fluida.

### 📐 1. Estrutura de Grid
* **Sidebar (Navegação)**: Largura fixa de `80px` (`w-20`). Ícones centralizados e arredondados.
* **Header (Topo)**: Altura de `80px` (`h-20`), contendo barra de pesquisa com bordas arredondadas e perfil do usuário do lado direito.
* **Área de Conteúdo (Main)**: Fundo suave e neutro, com espaçamento interno (padding) de `24px` (`p-6` ou `p-8`). Os componentes/cards utilizam um layout em grid responsivo (`grid-cols-1 lg:grid-cols-12`) com espaçamento de `24px` (`gap-6`).
* **Cards**: Cantos extremamente arredondados com `border-radius: 24px` (`rounded-3xl` ou `rounded-[24px]`).

---

## 🎨 2. Paleta de Cores (Color Tokens)

A paleta de cores é composta por tons vibrantes de roxo como cor principal da marca, combinados com acentos modernos (verde-lima e azul-turquesa) e um fundo neutro extremamente limpo.

| Categoria | Nome do Token | Valor Hex | Uso Recomendado |
| :--- | :--- | :--- | :--- |
| **Principal (Brand)** | `primary-purple` | `#7C3AED` | Botões ativos, barras principais, ícones ativos, fluxo principal. |
| **Secundário (Accent)** | `accent-lime` | `#C0F62C` | Destaques de sucesso, botões secundários, assinaturas e tags positivas. |
| **Terciário (Accent)** | `accent-blue` | `#06B6D4` | Indicadores de hardware, métricas de crescimento e dados secundários. |
| **Fundo Geral** | `bg-neutral-light`| `#F8FAFC` | Fundo principal da página (body/main background). |
| **Fundo de Card** | `bg-card` | `#FFFFFF` | Fundo de todos os cards da dashboard. |
| **Texto Primário** | `text-primary` | `#0F172A` | Títulos grandes, textos em destaque, labels importantes. |
| **Texto Secundário** | `text-muted` | `#64748B` | Subtítulos, descrições, labels de gráficos e estados inativos. |
| **Bordas** | `border-gray` | `#E2E8F0` | Bordas finas de cards, divisórias e inputs. |

### 🌗 3. Modo Escuro (Dark Mode)
* **Fundo Geral**: `#0B0F19` (azul-escuro profundo/quase preto).
* **Fundo de Card**: `#1E293B` (slate-800) ou `#111827` (gray-900).
* **Bordas**: `#334155` (slate-700).
* **Texto Primário**: `#F8FAFC` (slate-50).
* **Texto Secundário**: `#94A3B8` (slate-400).

---

## ✍️ 4. Tipografia

A tipografia deve passar uma sensação de modernidade, tecnologia e clareza geométrica.

* **Família de Fontes**: `Inter`, `Outfit` ou `Plus Jakarta Sans` (sempre utilizar uma fonte sans-serif moderna, geométrica e com ótima legibilidade).
* **Pesos de Fonte**:
  - `font-semibold` / `font-bold` para títulos principais e valores numéricos importantes.
  - `font-normal` / `font-medium` para descrições, labels e textos de apoio.
* **Tamanho de Cabeçalho**:
  - Título Principal: `text-3xl` (`28px` a `32px`), com espaçamento estreito entre letras (`tracking-tight`).
  - Títulos de Cards: `text-xl` (`20px`), peso `semibold`.
* **Valores de Métricas**: `text-2xl` ou `text-3xl` (`24px` a `30px`) com fonte semi-bold, para destacar números monetários/percentuais.

---

## 🧩 5. Padrões de Componentes de UI

### 🎴 Cards (Painéis de Informação)
* **Estilo**: Fundo `#FFFFFF`, borda fina de `1px` em `#E2E8F0`, cantos `rounded-[24px]` e sombra extremamente sutil (`shadow-sm`).
* **Elementos obrigatórios**: 
  - Título do card no canto superior esquerdo acompanhado de um ícone descritivo em tom cinza.
  - Botão de ação ou seta de expansão (ícone `ArrowUpRight` da biblioteca Lucide) no canto superior direito, dentro de um círculo cinza discreto ou transparente de hover.
  - Subtítulo explicativo curto em cor secundária (`#64748B`).

### 🔘 Botões e Pílulas (Pill Tabs)
* **Abas de Filtro**: Formato pílula completa (`rounded-full`). 
  - *Estado Ativo*: Fundo `#0F172A` com texto `#FFFFFF`.
  - *Estado Inativo*: Fundo `#F1F5F9` ou transparente com texto `#64748B`, aplicando hover com `#E2E8F0`.
* **Botões de Ação**: Bordas arredondadas médias (`rounded-xl` ou `rounded-full`), altura padrão de `40px` a `48px`, usando cores de destaque com texto em alto contraste.

---

## 📊 6. Modelos de Gráficos e Visualização de Dados

Os gráficos devem ser limpos, sem linhas de grade excessivas, usando as cores da paleta para dar contexto visual imediato.

1. **Diagrama de Fluxo / Sankey (Cash Flow)**
   - Representa a jornada do dinheiro (origens -> intermediários -> destinos).
   - Conectores curvos e semi-transparentes (`opacity-20` ou `opacity-30`) usando a cor do nó de origem (Roxo para Licenças, Verde para Assinaturas, Azul para Hardware).
   - Nós retangulares com cantos arredondados contendo o título da categoria, valor e variação percentual.

2. **Mapa de Distribuição Geográfica (Travel Expenses)**
   - Mapa-múndi minimalista com países coloridos em tons de roxo de acordo com a densidade/volume de despesas (escala de opacidade: roxo muito claro para menor volume, roxo escuro para maior volume).
   - Tooltip flutuante personalizado com fundo preto (`#0F172A`) e texto branco.

3. **Gráfico de Rosca / Doughnut (Transfer History)**
   - Gráfico circular com espessura média.
   - Segmentos coloridos utilizando a paleta padrão do projeto: Roxo (`#7C3AED`), Verde-Lima (`#C0F62C`), Azul-Turquesa (`#06B6D4`) e Cinza-Escuro (`#1E293B`).
   - Legendas externas simples com percentual centralizado ou dentro dos próprios segmentos se o tamanho permitir.

4. **Gráfico de Barras Verticais (Revenue)**
   - Eixo Y e linhas horizontais de grade muito sutis (cor `#F1F5F9`).
   - Barras em cinza claro (`#E2E8F0`) indicando histórico, com a barra ativa/corrente destacada em roxo sólido (`#7C3AED`).
   - Tooltip preto no topo da barra selecionada mostrando o valor exato.

5. **Gráfico de Funil (Salary Funnel Analytics)**
   - Funil horizontal dividido em segmentos com porcentagem decrescente (ex: 100% -> 72% -> 46% -> 24% -> 10%).
   - Gradiente de fundo roxo suave que diminui a opacidade e a altura à medida que o funil afunila.

---

## 🛡️ 7. Regras de Desenvolvimento e Implementação

1. **Mobile-First e Responsividade**: Todos os componentes devem quebrar de forma graciosa em telas menores, empilhando os cards verticalmente e convertendo a sidebar lateral para um menu inferior ou hambúrguer flutuante.
2. **Biblioteca de Ícones**: Usar exclusivamente `lucide-react` para manter a consistência de traço de 1.5px ou 2px.
3. **Animações**: Usar `framer-motion` para micro-interações suaves nos cards (`whileHover={{ y: -4 }}` ou transições de fade-in ao carregar a página).
4. **Tailwind CSS**: Usar classes de utilidade do Tailwind respeitando a paleta e os valores de border-radius customizados (`rounded-3xl` ou customizado no `tailwind.config.js`).

---

*Nota: Este arquivo deve ser lido e seguido pelo assistente de IA em todas as tarefas subsequentes de criação de código e componentes de UI para o MundoFitness.*
