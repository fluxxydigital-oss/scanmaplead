# ScanLead Map — Prompt de Construção do MVP com Puppeteer

## 1. Visão geral do sistema

Crie um sistema chamado **ScanLead Map**, focado em encontrar possíveis leads locais a partir de buscas automatizadas no Google Maps usando **Puppeteer**.

O objetivo do sistema é permitir que o usuário escolha parâmetros simples de busca, como **nicho**, **cidade** e **bairro opcional**, e o sistema execute uma varredura automatizada no Google Maps para retornar uma lista organizada de empresas encontradas.

O ScanLead Map deve funcionar como uma ferramenta de prospecção local para freelancers, agências, social medias, gestores de tráfego, criadores de sites, consultores de Google Meu Negócio e vendedores de soluções digitais.

A ideia central é:

> O usuário informa o tipo de negócio que deseja encontrar e a região. O sistema abre uma automação com Puppeteer, pesquisa no Google Maps, coleta os dados disponíveis dos negócios listados e organiza os resultados com score de oportunidade comercial.

---

## 2. Objetivo do MVP

O MVP não terá importação manual de CSV ou planilhas.

O MVP deve ter busca ativa via Puppeteer.

O usuário deverá preencher:

- Nicho obrigatório
- Cidade obrigatória
- Bairro opcional
- Quantidade máxima de leads desejada
- Filtros básicos opcionais

Exemplo de busca:

```txt
Nicho: clínica de estética
Cidade: Niterói
Bairro: Icaraí
Quantidade: 50 leads
```

O sistema deverá montar a busca automaticamente:

```txt
clínica de estética em Icaraí Niterói
```

Caso o bairro não seja informado:

```txt
clínica de estética em Niterói
```

---

## 3. Fluxo principal do usuário

1. Usuário acessa o dashboard.
2. Clica em “Nova Busca”.
3. Preenche nicho, cidade, bairro opcional e limite de leads.
4. Clica em “Iniciar Scan”.
5. O backend cria uma tarefa de busca.
6. O Puppeteer abre o Google Maps em modo automatizado.
7. O robô pesquisa o termo gerado.
8. O sistema percorre os resultados da lateral do Google Maps.
9. Para cada empresa encontrada, o sistema abre o card do negócio.
10. O sistema coleta os dados disponíveis.
11. O sistema salva os leads no banco de dados.
12. O frontend mostra o progresso da busca em tempo real.
13. Ao finalizar, o usuário vê a lista de leads encontrados.
14. O usuário pode filtrar, ordenar, abrir detalhes, copiar abordagem e marcar status no CRM.

---

## 4. Dados que o Puppeteer deve tentar coletar

Para cada lead encontrado no Google Maps, o sistema deve tentar capturar:

- Nome da empresa
- Categoria/nicho exibido
- Nota média
- Quantidade de avaliações
- Endereço
- Bairro, quando possível
- Cidade
- Telefone
- Website
- Link do Google Maps
- Horário de funcionamento, se disponível
- Status de funcionamento, se disponível
- Trecho de descrição, se disponível
- Fotos disponíveis, se possível apenas URL de imagem pública
- Indicação se possui site
- Indicação se o site é Instagram, Facebook, Linktree ou domínio próprio
- Data da busca
- Termo pesquisado

Importante: nem todos os dados estarão disponíveis em todos os cards. O sistema deve lidar com campos nulos sem quebrar a busca.

---

## 5. Regras de busca

O sistema deve receber os parâmetros do usuário e gerar uma query padronizada.

### Com bairro

```ts
const query = `${nicho} em ${bairro} ${cidade}`;
```

### Sem bairro

```ts
const query = `${nicho} em ${cidade}`;
```

### Exemplos

```txt
restaurante em Centro Niterói
barbearia em Itaboraí
clínica odontológica em Maricá
pet shop em Alcântara São Gonçalo
imobiliária em Itaipuaçu Maricá
```

---

## 6. Comportamento do Puppeteer

Crie um worker separado para executar a busca com Puppeteer.

O fluxo do robô deve ser:

1. Abrir o navegador.
2. Acessar `https://www.google.com/maps`.
3. Aguardar carregamento.
4. Preencher o campo de busca com a query.
5. Pressionar Enter.
6. Aguardar resultados.
7. Rolar a lista lateral gradualmente.
8. Coletar os cards encontrados.
9. Abrir cada card individualmente.
10. Extrair dados do painel lateral.
11. Evitar duplicidade pelo nome + endereço ou link do Maps.
12. Salvar cada lead conforme for encontrado.
13. Atualizar o progresso da tarefa.
14. Encerrar o navegador ao finalizar ou ao atingir o limite definido.

O sistema deve ser resiliente. Se um card falhar, o robô deve registrar erro naquele item e continuar para o próximo.

---

## 7. Cuidados técnicos importantes

O Puppeteer deve ser configurado com:

- Timeouts controlados
- Retries por etapa
- Logs da execução
- Delay aleatório entre ações
- Scroll progressivo
- Tratamento de captcha/bloqueio
- Possibilidade de rodar headless e não-headless
- Limite de leads por busca
- Limite de buscas simultâneas

Nunca deixe o sistema executar buscas ilimitadas.

Para o MVP, limite recomendado:

- 1 busca ativa por usuário
- Até 50 leads por busca no plano inicial
- Até 3 buscas simultâneas no servidor inteiro

---

## 8. Stack recomendada

### Frontend

Use:

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide Icons
- React Hook Form
- Zod

### Backend

Use:

- Next.js API Routes ou NestJS
- TypeScript
- Prisma
- PostgreSQL
- Redis
- BullMQ
- Puppeteer ou puppeteer-extra

### Banco de dados

Use:

- PostgreSQL para dados principais
- Redis para fila de buscas e progresso em tempo real

### Tempo real

Use uma das opções:

- Server-Sent Events
- WebSocket
- Polling simples no MVP

Para começar mais rápido, use polling simples a cada 2 ou 3 segundos.

---

## 9. Arquitetura recomendada

Divida o sistema em 4 partes:

### 1. Frontend

Responsável por:

- Formulário de busca
- Dashboard
- Lista de leads
- Tela de detalhes
- CRM simples
- Visualização de progresso

### 2. API

Responsável por:

- Criar busca
- Listar buscas
- Listar leads
- Atualizar status do lead
- Gerar mensagem de abordagem
- Retornar progresso da busca

### 3. Worker Puppeteer

Responsável por:

- Executar a busca no Google Maps
- Navegar pelos resultados
- Coletar dados
- Salvar leads
- Atualizar progresso

### 4. Banco de dados

Responsável por:

- Usuários
- Buscas
- Leads
- Status comerciais
- Logs da automação

---

## 10. Telas do MVP

## 10.1 Dashboard

A tela inicial deve mostrar:

- Total de leads encontrados
- Leads quentes
- Leads sem site
- Leads abordados
- Leads que responderam
- Buscas realizadas
- Últimas buscas

Cards principais:

```txt
Leads encontrados: 248
Leads quentes: 74
Sem site: 112
Abordados: 35
Responderam: 8
Fechados: 2
```

Botão principal:

```txt
+ Nova Busca
```

---

## 10.2 Nova Busca

Campos:

- Nicho
- Cidade
- Bairro opcional
- Quantidade máxima de leads
- Checkbox: priorizar empresas sem site
- Checkbox: priorizar empresas com telefone
- Checkbox: priorizar empresas com muitas avaliações

Botão:

```txt
Iniciar Scan
```

Ao clicar, criar uma nova tarefa e redirecionar para a tela de progresso.

---

## 10.3 Progresso da Busca

Mostrar:

- Query pesquisada
- Status atual
- Leads encontrados até o momento
- Leads salvos
- Tempo de execução
- Logs simplificados
- Barra de progresso

Status possíveis:

```txt
Aguardando
Iniciando navegador
Pesquisando no Maps
Coletando cards
Abrindo empresas
Salvando leads
Finalizado
Erro
Cancelado
```

Botões:

- Ver leads encontrados
- Cancelar busca

---

## 10.4 Lista de Leads

Tabela com:

- Nome
- Categoria
- Nota
- Avaliações
- Telefone
- Site
- Cidade
- Bairro
- Score
- Status
- Ações

Filtros:

- Todos
- Sem site
- Com telefone
- Com WhatsApp
- Site é Instagram
- Score alto
- Não abordado
- Abordado
- Respondeu
- Fechado

Ações:

- Ver detalhes
- Abrir Google Maps
- Abrir site
- Copiar mensagem
- Marcar como abordado

---

## 10.5 Detalhe do Lead

Mostrar:

- Nome da empresa
- Categoria
- Endereço
- Bairro
- Cidade
- Telefone
- Site
- Link do Maps
- Nota
- Quantidade de avaliações
- Status digital
- Score de oportunidade
- Motivo do score
- Mensagem sugerida
- Histórico de status

Botões:

- Copiar mensagem
- Abrir WhatsApp, se possível
- Abrir site
- Abrir Google Maps
- Marcar como abordado
- Marcar como respondeu
- Marcar como reunião
- Marcar como fechado
- Marcar como perdido

---

## 11. CRM simples

Cada lead deve ter um status comercial:

```txt
Novo
Abordado
Respondeu
Reunião
Fechado
Perdido
Ignorado
```

O usuário deve poder alterar o status manualmente.

O sistema deve registrar a data da última atualização.

---

## 12. Score de oportunidade

Cada lead deve receber um score de 0 a 100.

Critérios sugeridos:

### Presença digital fraca

- Não tem site: +30
- Site é Instagram: +25
- Site é Facebook: +20
- Site é Linktree: +15
- Site existe, mas não tem domínio próprio: +10

### Potencial comercial

- Nota maior ou igual a 4.5: +15
- Mais de 100 avaliações: +20
- Entre 50 e 99 avaliações: +15
- Entre 20 e 49 avaliações: +10

### Facilidade de contato

- Tem telefone: +15
- Telefone parece celular/WhatsApp: +10

### Nichos com alta chance de compra de site

Adicionar bônus para nichos como:

- Clínica de estética
- Barbearia
- Salão de beleza
- Dentista
- Imobiliária
- Restaurante
- Pet shop
- Oficina
- Academia
- Clínica médica
- Escola particular

Bônus: +10

Classificação:

```txt
0 a 39 = Lead frio
40 a 69 = Lead médio
70 a 100 = Lead quente
```

---

## 13. Mensagem de abordagem automática

O sistema deve gerar uma mensagem personalizada com base nos dados do lead.

Modelo:

```txt
Oi, tudo bem?

Encontrei a [Nome da Empresa] pesquisando negócios locais em [Cidade] e vi que vocês têm uma boa presença no Google, com [Quantidade de Avaliações] avaliações e nota [Nota].

Também percebi que vocês ainda não têm um site próprio profissional, ou usam apenas uma rede social como principal presença online.

Hoje, um site simples e bem construído poderia ajudar a passar mais confiança, apresentar melhor os serviços e facilitar o contato de novos clientes pelo WhatsApp.

Fiz uma ideia rápida de como isso poderia ficar para vocês.

Posso te mandar?
```

Se o lead tiver site:

```txt
Oi, tudo bem?

Encontrei a [Nome da Empresa] pesquisando negócios locais em [Cidade] e vi que vocês já têm uma boa reputação no Google.

Também dei uma olhada na presença digital de vocês e acredito que existe espaço para melhorar a forma como os serviços são apresentados e como os clientes chegam até o WhatsApp.

Fiz uma ideia rápida de melhoria visual e comercial para vocês.

Posso te mandar?
```

---

## 14. Modelo de banco com Prisma

Crie os modelos abaixo:

```prisma
model User {
  id        String   @id @default(cuid())
  name      String?
  email     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  searches  Search[]
  leads     Lead[]
}

model Search {
  id              String       @id @default(cuid())
  userId          String
  niche           String
  city            String
  neighborhood    String?
  query           String
  maxLeads        Int          @default(50)
  status          SearchStatus @default(PENDING)
  totalFound      Int          @default(0)
  totalSaved      Int          @default(0)
  errorMessage    String?
  startedAt       DateTime?
  finishedAt      DateTime?
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  user User @relation(fields: [userId], references: [id])
  leads Lead[]
  logs SearchLog[]
}

enum SearchStatus {
  PENDING
  STARTING_BROWSER
  SEARCHING_MAPS
  COLLECTING_CARDS
  OPENING_PLACES
  SAVING_LEADS
  FINISHED
  ERROR
  CANCELLED
}

model SearchLog {
  id        String   @id @default(cuid())
  searchId  String
  level     LogLevel @default(INFO)
  message   String
  createdAt DateTime @default(now())

  search Search @relation(fields: [searchId], references: [id])
}

enum LogLevel {
  INFO
  WARNING
  ERROR
}

model Lead {
  id              String     @id @default(cuid())
  userId          String
  searchId        String
  name            String
  category        String?
  rating          Float?
  reviewCount     Int?
  address         String?
  neighborhood    String?
  city            String?
  phone           String?
  website         String?
  mapsUrl         String?
  businessStatus  String?
  openingHours    String?
  hasWebsite      Boolean    @default(false)
  websiteType     WebsiteType?
  score           Int        @default(0)
  scoreLabel      ScoreLabel @default(COLD)
  scoreReason     String?
  crmStatus       CrmStatus  @default(NEW)
  approachMessage String?
  rawData         Json?
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt

  user   User   @relation(fields: [userId], references: [id])
  search Search @relation(fields: [searchId], references: [id])

  @@unique([userId, name, address])
}

enum WebsiteType {
  NONE
  OWN_DOMAIN
  INSTAGRAM
  FACEBOOK
  LINKTREE
  WHATSAPP
  OTHER
}

enum ScoreLabel {
  COLD
  MEDIUM
  HOT
}

enum CrmStatus {
  NEW
  CONTACTED
  REPLIED
  MEETING
  CLOSED
  LOST
  IGNORED
}
```

---

## 15. Rotas da API

Crie as seguintes rotas:

```txt
POST /api/searches
GET /api/searches
GET /api/searches/:id
GET /api/searches/:id/progress
POST /api/searches/:id/cancel
GET /api/leads
GET /api/leads/:id
PATCH /api/leads/:id/status
POST /api/leads/:id/generate-message
```

### POST /api/searches

Body:

```json
{
  "niche": "clínica de estética",
  "city": "Niterói",
  "neighborhood": "Icaraí",
  "maxLeads": 50
}
```

Resposta:

```json
{
  "id": "search_id",
  "query": "clínica de estética em Icaraí Niterói",
  "status": "PENDING"
}
```

---

## 16. Worker Puppeteer — pseudo código

```ts
async function runGoogleMapsScan(searchId: string) {
  const search = await db.search.findUnique({ where: { id: searchId } });

  await updateStatus(searchId, 'STARTING_BROWSER');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });

    await updateStatus(searchId, 'SEARCHING_MAPS');
    await page.goto('https://www.google.com/maps', { waitUntil: 'networkidle2' });

    await page.waitForSelector('input#searchboxinput');
    await page.type('input#searchboxinput', search.query, { delay: 80 });
    await page.keyboard.press('Enter');

    await page.waitForTimeout(5000);

    await updateStatus(searchId, 'COLLECTING_CARDS');

    const placeLinks = await collectPlaceLinks(page, search.maxLeads);

    await updateStatus(searchId, 'OPENING_PLACES');

    for (const link of placeLinks) {
      try {
        const leadData = await extractPlaceDetails(page, link);
        const score = calculateLeadScore(leadData, search.niche);
        const message = generateApproachMessage(leadData);

        await saveLead({
          ...leadData,
          userId: search.userId,
          searchId: search.id,
          score: score.value,
          scoreLabel: score.label,
          scoreReason: score.reason,
          approachMessage: message,
        });

        await incrementSearchProgress(searchId);
      } catch (error) {
        await createSearchLog(searchId, 'ERROR', `Erro ao coletar lead: ${error.message}`);
        continue;
      }
    }

    await updateStatus(searchId, 'FINISHED');
  } catch (error) {
    await updateSearchError(searchId, error.message);
  } finally {
    await browser.close();
  }
}
```

---

## 17. Função de classificação do site

Crie uma função para classificar o website encontrado:

```ts
function classifyWebsite(url?: string): WebsiteType {
  if (!url) return 'NONE';

  const normalized = url.toLowerCase();

  if (normalized.includes('instagram.com')) return 'INSTAGRAM';
  if (normalized.includes('facebook.com')) return 'FACEBOOK';
  if (normalized.includes('linktr.ee') || normalized.includes('linktree')) return 'LINKTREE';
  if (normalized.includes('wa.me') || normalized.includes('whatsapp')) return 'WHATSAPP';

  return 'OWN_DOMAIN';
}
```

---

## 18. Função de score

Crie uma função de score:

```ts
function calculateLeadScore(lead: LeadData, niche: string) {
  let score = 0;
  const reasons: string[] = [];

  const websiteType = classifyWebsite(lead.website);

  if (websiteType === 'NONE') {
    score += 30;
    reasons.push('Não possui site cadastrado.');
  }

  if (websiteType === 'INSTAGRAM') {
    score += 25;
    reasons.push('Usa Instagram como principal presença digital.');
  }

  if (websiteType === 'FACEBOOK') {
    score += 20;
    reasons.push('Usa Facebook como site principal.');
  }

  if (lead.rating && lead.rating >= 4.5) {
    score += 15;
    reasons.push('Possui boa avaliação no Google.');
  }

  if (lead.reviewCount && lead.reviewCount >= 100) {
    score += 20;
    reasons.push('Possui alto volume de avaliações.');
  } else if (lead.reviewCount && lead.reviewCount >= 50) {
    score += 15;
    reasons.push('Possui volume relevante de avaliações.');
  } else if (lead.reviewCount && lead.reviewCount >= 20) {
    score += 10;
    reasons.push('Possui avaliações suficientes para indicar demanda local.');
  }

  if (lead.phone) {
    score += 15;
    reasons.push('Possui telefone disponível para contato.');
  }

  const hotNiches = [
    'clínica de estética',
    'estética',
    'barbearia',
    'salão de beleza',
    'dentista',
    'odontologia',
    'imobiliária',
    'restaurante',
    'pet shop',
    'oficina',
    'academia',
    'clínica médica',
    'escola particular',
  ];

  if (hotNiches.some(item => niche.toLowerCase().includes(item))) {
    score += 10;
    reasons.push('Nicho com boa propensão para compra de presença digital.');
  }

  score = Math.min(score, 100);

  let label: 'COLD' | 'MEDIUM' | 'HOT' = 'COLD';
  if (score >= 70) label = 'HOT';
  else if (score >= 40) label = 'MEDIUM';

  return {
    value: score,
    label,
    reason: reasons.join(' '),
  };
}
```

---

## 19. Prompt visual do sistema

Crie uma interface moderna, escura ou clara, com aparência SaaS premium.

A identidade visual deve transmitir:

- Tecnologia
- Velocidade
- Inteligência comercial
- Prospecção local
- Clareza
- Organização

Use elementos visuais como:

- Cards de métricas
- Tabelas modernas
- Badges de score
- Barra de progresso
- Status coloridos
- Ícones de mapa, radar, alvo, telefone, site, WhatsApp e gráfico

Sugestão de cores:

- Fundo claro: branco e cinza muito claro
- Primária: azul ou verde tecnológico
- Destaque de lead quente: vermelho/laranja
- Lead médio: amarelo
- Lead frio: cinza/azul

---

## 20. Roadmap de construção do MVP

### Fase 1 — Estrutura base

- Criar projeto Next.js com TypeScript
- Configurar Tailwind
- Configurar shadcn/ui
- Configurar Prisma
- Configurar PostgreSQL
- Criar modelos do banco
- Criar autenticação simples

### Fase 2 — Módulo de busca

- Criar tela Nova Busca
- Criar API POST /api/searches
- Salvar busca no banco
- Criar status da busca
- Criar tela de progresso

### Fase 3 — Worker Puppeteer

- Configurar BullMQ e Redis
- Criar job de busca
- Abrir Google Maps
- Pesquisar query
- Coletar links dos lugares
- Abrir cards
- Extrair dados
- Salvar leads
- Atualizar progresso

### Fase 4 — Lista de leads

- Criar tabela de leads
- Criar filtros
- Criar ordenação
- Criar tela de detalhe
- Criar status de CRM

### Fase 5 — Score e mensagem

- Implementar classificação de site
- Implementar score
- Implementar mensagem automática
- Exibir motivo da oportunidade

### Fase 6 — Refinamento

- Melhorar logs
- Melhorar tratamento de erro
- Criar cancelamento de busca
- Criar limite por usuário
- Melhorar interface
- Preparar deploy

---

## 21. Regras importantes do MVP

- O sistema não deve depender de importação de planilha.
- A busca deve ser feita pelos parâmetros informados pelo usuário.
- O Puppeteer deve executar a busca automaticamente.
- O usuário deve conseguir acompanhar o progresso.
- Os leads devem ser salvos no banco.
- Os leads devem ter score de oportunidade.
- O usuário deve conseguir usar os leads dentro do próprio sistema.
- O sistema deve ser preparado para evoluir para um SaaS.

---

## 22. Observação de conformidade e estabilidade

Como o sistema usa automação de navegador em uma plataforma externa, implemente limites, logs, controle de uso e tratamento de bloqueios.

Evite comportamento agressivo, buscas ilimitadas, múltiplas abas em massa ou coleta excessiva.

O MVP deve ser usado com moderação, respeitando limites técnicos e operacionais.

---

## 23. Prompt final para usar na IDE

Construa um MVP SaaS chamado **ScanLead Map**.

O sistema deve permitir que o usuário encontre leads locais usando busca automatizada no Google Maps com Puppeteer.

O usuário deve preencher:

- Nicho
- Cidade
- Bairro opcional
- Quantidade máxima de leads

O sistema deve gerar uma query, executar uma busca automatizada com Puppeteer no Google Maps, percorrer os resultados encontrados, abrir os cards das empresas, coletar os dados disponíveis e salvar tudo no banco.

Depois da busca, o sistema deve exibir os leads em uma tabela com filtros, score de oportunidade, status comercial e mensagem automática de abordagem.

Use Next.js, TypeScript, Tailwind, shadcn/ui, Prisma, PostgreSQL, Redis, BullMQ e Puppeteer.

Crie as telas:

1. Dashboard
2. Nova Busca
3. Progresso da Busca
4. Lista de Leads
5. Detalhe do Lead

Crie o backend com:

1. API de criação de busca
2. API de progresso
3. Worker Puppeteer
4. Salvamento de leads
5. Cálculo de score
6. CRM simples
7. Geração de mensagem

O foco do MVP é entregar uma experiência simples e funcional:

> O usuário informa o nicho e a região, o sistema faz o scan, encontra empresas locais e mostra quais têm maior chance de virar cliente.

