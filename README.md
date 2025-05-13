# Sistema de Gerenciamento de Outdoors Digitais

Sistema web para gerenciamento de anúncios em outdoors digitais, permitindo que clientes cadastrem e gerenciem seus anúncios e outdoors.

## Funcionalidades

- Autenticação de usuários (clientes)
- Cadastro e gerenciamento de outdoors
- Upload e gerenciamento de anúncios (imagens e vídeos)
- Vinculação de anúncios aos outdoors
- Visualização dos anúncios em tela cheia
- Interface responsiva e amigável

## Tecnologias Utilizadas

- **Backend:** Python (Flask)
- **Frontend:** HTML, CSS, JavaScript
- **Banco de Dados:** Arquivos JSON locais (`usuarios.json`, `outdoors.json`, `anuncios.json`)

## Requisitos

- Python 3.8 ou superior
- Flask (`pip install flask`)

## Instalação e Execução

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITORIO]
cd outdoor
```

2. Instale as dependências do Python:
```bash
pip install flask
```

3. Inicie o servidor Flask:
```bash
python app.py
```

4. Acesse o sistema pelo navegador:
```
http://localhost:3000
```

## Uso

1. Registre-se como um novo cliente pelo `index.html` (aba Registro).
2. Faça login com suas credenciais.
3. Cadastre e gerencie seus outdoors e anúncios.
4. Vincule anúncios aos outdoors conforme necessário.

## Estrutura dos Arquivos
- `app.py`: Backend Flask e rotas da API
- `public/index.html`: Página inicial com login e registro
- `public/dashboard.html`: Painel principal do usuário
- `usuarios.json`, `outdoors.json`, `anuncios.json`: Armazenamento local dos dados

## Observações
- As senhas dos usuários são armazenadas em texto simples (apenas para fins didáticos). Para produção, recomenda-se utilizar hash de senha.
- O sistema não utiliza MongoDB nem Node.js.
- O cadastro de usuários é feito apenas pelo `index.html`.

## Licença
Projeto didático para gerenciamento de outdoors digitais.

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