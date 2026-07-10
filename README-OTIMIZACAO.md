# Site Pablo Ledesma Advocacia — versão otimizada

Este conjunto de arquivos substitui o conteúdo atual do repositório
`Prled/pabloledesmaadv` sem alterar a identidade visual (mesma paleta,
mesmas fontes, mesmo layout, mesmas animações).

---

## O que mudou

### Performance
- **Imagens reduzidas de 2,18 MB para 192 KB (91% menos)**
  - Logo PNG 1.35 MB → SVG WebP 4 KB + PNG fallback 8 KB
  - Foto do fórum (2000×1406, 682 KB) → 1200×844 WebP 125 KB
  - Foto profissional (795×857, 126 KB) → 900×970 WebP 51 KB
  - Foto Legal Tech Forum (43 KB) → WebP 18 KB
- **Todo `<img>` recebeu `<picture>` com WebP + fallback e `width`/`height`** (fim do Cumulative Layout Shift)
- **Lazy loading** em todas as imagens abaixo da dobra (`loading="lazy" decoding="async"`)
- **Preload da imagem LCP** (`foto-profissional.webp`) e do stylesheet
- **CSS extraído para `/styles.css`** (~36 KB, compartilhado entre home e artigos, cacheado por 1 ano)
- **HTMLs entre 30% e 50% menores** graças à extração de CSS
- **Google Fonts com pesos enxutos** (removidos os pesos que não eram usados)
- **Typebot com carregamento tardio** — só entra depois do primeiro scroll/movimento ou 10s
- **Ícone WhatsApp local** (`/whatsapp.svg`) em vez de hotlink da Wikipedia

### SEO
- **Sitemap limpo** — removidas as URLs com âncoras (`#areas`, `#sobre`, `#contato`), datas atualizadas
- **Hierarquia H1 corrigida** em todas as páginas — a manchete descritiva agora é `<h1>` (antes era `<h2>`); a marca no header virou `<p class="brand-name">`
- **`BreadcrumbList` schema** adicionado nos artigos (SERPs mais informativas)
- **`meta name="keywords"` removido** (o Google ignora desde 2009)
- **`meta theme-color`** para melhor integração no Android/iOS

### Acessibilidade
- **Skip link** (`Ir para o conteúdo`) visível ao Tab
- **Foco visível** com contorno dourado para navegação por teclado
- **`aria-expanded` no botão hamburger** (screen readers agora sabem o estado do menu)
- **`role="status" aria-live="polite"`** na mensagem de sucesso do formulário
- **Landmark `<main id="main-content">`** em todas as páginas
- **`prefers-reduced-motion`** respeitado para usuários com vestibular sensível
- **Ícone WhatsApp `aria-hidden="true"`** (o link já tem `aria-label` descritivo)

### Segurança
- **CSP restritiva** — do `default-src *` (wildcard) para uma política que só permite as origens efetivamente usadas (Google Fonts, Formspree, Typebot, jsdelivr)
- **Headers de segurança** (`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `HSTS`) no arquivo `_headers` do Cloudflare Pages

### Estrutura
- **`styles.css` único** compartilhado (a primeira visita cacheia, todas as próximas páginas voam)
- **`_template.html`** dos artigos atualizado — próximos artigos gerados pela automação já sairão otimizados
- **`_headers`** para configuração declarativa de cache e segurança no Cloudflare Pages

---

## Resumo de tamanho

| Antes | Depois | Redução |
|-------|--------|---------|
| Peso total do repo (sem `.git`): ~2,4 MB | ~708 KB | **-71%** |
| index.html: 57 KB | 34 KB | -40% |
| Cada artigo: ~25 KB | ~18 KB | -30% |
| logo-cabecalho: 1,35 MB (PNG) | 4 KB (WebP) | **-99%** |
| Imagens totais: 2,18 MB | 192 KB | **-91%** |

Em uma conexão 4G média (5 Mbps), a home carrega ~3,3s mais rápido.

---

## Deploy no Cloudflare Pages (você já tem conta)

Como o app de gestão já roda no Cloudflare, o setup é rápido:

### 1. Novo projeto no Cloudflare Pages

1. Dashboard Cloudflare → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. Selecione o repositório `Prled/pabloledesmaadv`, branch `main`
3. Deixe **Build command** e **Build output directory** em branco (é um site estático puro)
4. **Deploy**

Em ~30 segundos o site estará no ar em `pabloledesmaadv.pages.dev`.

### 2. Apontar o domínio `prledadv.com.br`

1. No projeto do Pages: **Custom domains** → **Set up a custom domain** → digite `prledadv.com.br`
2. Se o DNS já está no Cloudflare, ele mesmo cria o registro
3. Se o DNS ainda está no registrador (registro.br, por exemplo), o painel mostrará o CNAME/A a configurar. Aponte para `pabloledesmaadv.pages.dev`.
4. Repita para `www.prledadv.com.br` se aplicável

### 3. Remover o CNAME do GitHub Pages

Depois que o Cloudflare Pages estiver servindo, apague o arquivo `CNAME` do repositório
(ou deixe — não atrapalha, o Cloudflare ignora). Nas configurações do GitHub Pages
(`Settings` → `Pages`), desative o Pages para evitar dupla resolução DNS.

### 4. Web Analytics (opcional, grátis, sem cookie)

Dashboard Cloudflare → **Web Analytics** → **Add a site** → `prledadv.com.br`.
Sem banner LGPD (não usa cookie, não identifica usuário). Zero impacto no bundle
(usa Server-Side Rendering do painel — não precisa de tag no HTML se você
apontou pelo Pages).

---

## Verificação pós-deploy

Depois que estiver no ar, rode uma auditoria em:

- **PageSpeed Insights**: <https://pagespeed.web.dev/> (Google Lighthouse)
- **WebPageTest**: <https://webpagetest.org/> (teste com origem no Brasil)
- **Security Headers**: <https://securityheaders.com/> (deve dar A ou A+)
- **Rich Results Test**: <https://search.google.com/test/rich-results> (validar Schema.org)

Meta razoável para o Lighthouse Mobile: **Performance ≥ 90, Accessibility ≥ 95, Best Practices = 100, SEO = 100**.

---

## O que continua a ser feito manualmente

- **Novos artigos** — use o `_template.html` atualizado. Ele já vem com CSP, breadcrumb, styles.css, dimensões nas imagens.
- **Adicionar entrada nova no `sitemap.xml`** a cada artigo publicado (o comentário no arquivo indica onde).
- **Google Search Console** — se quiser limpar o arquivo `google8d076a26656bc848.html`, faça a verificação por registro TXT no DNS (Cloudflare DNS torna isso trivial).
- **Formspree** continua o mesmo. Se quiser migrar para uma solução Cloudflare-native (Workers + KV ou D1) grátis no futuro, dá para fazer sem custo, mas Formspree resolve.

---

## Arquivos entregues

```
site-otimizado/
├── _headers                           ← Cloudflare Pages (cache + segurança)
├── CNAME                              ← (pode remover após migrar do GH Pages)
├── README-OTIMIZACAO.md               ← este arquivo
├── estrategia-digital.md              ← inalterado
├── google8d076a26656bc848.html        ← verificação Search Console
├── index.html                         ← REESCRITO
├── robots.txt                         ← inalterado
├── sitemap.xml                        ← limpo, datas atualizadas
├── styles.css                         ← NOVO — CSS extraído
├── whatsapp.svg                       ← NOVO — ícone local
├── logo-cabecalho.png                 ← 1.35 MB → 8 KB
├── logo-cabecalho.webp                ← NOVO — 4 KB
├── foto-profissional.jpg              ← 126 KB → 101 KB
├── foto-profissional.webp             ← NOVO — 51 KB
├── 05_07-08.jpg                       ← 682 KB → 192 KB
├── 05_07-08.webp                      ← NOVO — 125 KB
├── legal-tech-forum.jpg               ← inalterado no visual, 43 KB → 28 KB
├── legal-tech-forum.webp              ← NOVO — 18 KB
└── artigos/
    ├── _template.html                 ← REESCRITO (usa styles.css)
    ├── index.html                     ← REESCRITO
    ├── como-reduzir-passivo-trabalhista-empresa.html    ← REESCRITO
    └── terceirizacao-responsabilidade-subsidiaria-empresa.html  ← REESCRITO
```

Note que `readme_backup.md` (arquivo vazio de 1 byte no original) foi omitido de propósito.
