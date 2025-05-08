# Sistema de Gerenciamento de Outdoors Digitais

Sistema web para gerenciamento de anúncios em outdoors digitais, permitindo que clientes cadastrem e gerenciem seus anúncios e outdoors.

## Funcionalidades

- Autenticação de usuários (clientes e administradores)
- Cadastro e gerenciamento de outdoors
- Upload e gerenciamento de anúncios (imagens e vídeos)
- Vinculação de anúncios aos outdoors
- Visualização pública dos anúncios em tela cheia
- Interface responsiva e amigável

## Requisitos

- Node.js 14.x ou superior
- MongoDB
- NPM ou Yarn

## Instalação

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITORIO]
cd outdoor-digital
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```
MONGODB_URI=sua_url_do_mongodb
JWT_SECRET=sua_chave_secreta
PORT=3000
```

4. Crie a pasta para uploads:
```bash
mkdir -p public/uploads
```

5. Inicie o servidor:
```bash
npm start
```

Para desenvolvimento, use:
```bash
npm run dev
```

## Uso

1. Acesse o sistema em `http://localhost:3000`
2. Registre-se como um novo cliente
3. Faça login com suas credenciais
4. Comece a cadastrar seus outdoors e anúncios

### Como Usar

1. **Cadastro de Outdoors**
   - Clique em "Novo Outdoor"
   - Preencha os dados do outdoor (nome, localização, tipo)
   - Salve o outdoor

2. **Cadastro de Anúncios**
   - Clique em "Novo Anúncio"
   - Selecione o tipo (imagem ou vídeo)
   - Faça upload do arquivo
   - Para vídeos, defina a duração
   - Salve o anúncio

3. **Vincular Anúncios**
   - Vá para a aba "Vincular Anúncios"
   - Selecione o outdoor e o anúncio
   - Clique em "Vincular"

4. **Visualização Pública**
   - Cada outdoor possui um código público único
   - Acesse `http://localhost:3000/outdoor/[codigo]` para ver os anúncios
   - A visualização é em tela cheia e automática

## Estrutura do Projeto

```
├── src/
│   ├── models/         # Modelos do MongoDB
│   ├── routes/         # Rotas da API
│   ├── middleware/     # Middlewares
│   └── server.js       # Arquivo principal
├── public/
│   ├── uploads/        # Arquivos de mídia
│   ├── index.html      # Página inicial
│   ├── dashboard.html  # Painel de controle
│   └── outdoor.html    # Visualização pública
├── .env               # Variáveis de ambiente
└── package.json       # Dependências
```

## Segurança

- Autenticação via JWT
- Senhas criptografadas
- Validação de arquivos
- Controle de acesso baseado em perfil

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes. 