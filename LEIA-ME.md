# Gastos no Chat — como colocar no ar (≈20 min)

Cada pessoa tem **usuário e senha** e vê **só os próprios gastos**. O áudio é gravado no app, transcrito no servidor e lançado sozinho.

## 1) Firebase (grátis)
1. console.firebase.google.com → **Criar projeto**.
2. **Authentication** → Começar → ative **E-mail/senha**.
3. **Firestore Database** → Criar banco → modo produção.
4. Firestore → aba **Regras** → cole o conteúdo de `firestore.rules` → Publicar.
5. Configurações do projeto (engrenagem) → **Seus apps** → app Web `</>` → copie o `firebaseConfig`.
6. Abra `index.html` e cole os valores em `CFG` (apiKey, authDomain, projectId, appId). Troque também `CODIGO_CONVITE` por um código seu.

## 2) Chave da transcrição de áudio
1. platform.openai.com → API keys → crie uma chave.
2. Coloque crédito (US$ 5 rende muito; a transcrição custa cerca de US$ 0,006 por minuto de áudio).

## 3) Netlify
1. Suba esta pasta num repositório do GitHub e conecte no Netlify (como no VAULT), ou arraste a pasta no Netlify.
2. Site settings → **Environment variables**, crie:
   - `OPENAI_API_KEY` = sua chave da OpenAI
3. Faça um novo deploy depois de criar a variável.
4. Firebase → Authentication → Configurações → **Domínios autorizados** → adicione o endereço do seu site Netlify.

## 4) Criar os usuários
1. Abra o site → **Criar** → usuário, senha e o código de convite. Faça uma conta para cada pessoa.
2. Depois de criar as duas, feche o cadastro: Firebase → Authentication → Configurações → Ações do usuário → desmarque “Ativar criação (cadastro)”. Assim ninguém mais entra. (O código de convite sozinho é fraco, porque fica visível no código da página.)

## Uso
- Digite “mercado 15” ou toque 🎤, fale “posto de gasolina duzentos reais”, toque ⏹.
- Exportar → copia ou baixa o relatório do mês em .txt para mandar à IA.
- No celular: Compartilhar/menu → Adicionar à tela inicial.

## Limites
- Áudio de até 60 segundos.
- Esqueceu a senha? Não há recuperação por e-mail (o login é por usuário). Apague e recrie a conta em Authentication ou redefina por lá.
