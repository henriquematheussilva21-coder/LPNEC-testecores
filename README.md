# LPNEC - Coleta de Dados e Teste de Cores

Aplicação web desenvolvida para a coleta estruturada de dados e preferências visuais dos participantes do LPNEC/UFPB. O sistema consolida as interações no front-end e automatiza o envio de relatórios via API RESTful, garantindo alta disponibilidade e segurança na entrega das informações.

## 🛠️ Stack Tecnológico e Infraestrutura
* **Front-end:** HTML5, CSS3, JavaScript (Vanilla) para requisições assíncronas (Fetch API).
* **Integração de Mensageria:** API REST do EmailJS operando via Custom SMTP autônomo.
* **Hospedagem e Deploy:** GitHub Pages.
* **Redes e Segurança:** DNS Customizado (Registro.br) com roteamento CNAME/IPv4 e criptografia SSL/TLS (HTTPS forçado).

## ⚙️ Desafios Técnicos Solucionados
* **Governança de Autenticação:** Substituição da autenticação OAuth padrão por uma rota Custom SMTP com Senha de Aplicativo (App Password), eliminando a expiração de tokens e falhas HTTP 412 (Invalid grant).
* **Roteamento de Domínio:** Configuração avançada de zona DNS, assegurando a propagação global correta para o domínio oficial `lpnec.com.br` e mitigando falsos positivos em softwares de Endpoint Protection.
* **Experiência do Usuário (UX):** Tratamento de dados no client-side sem recarregamento de página, garantindo fluidez durante os testes de usabilidade.

## 👨‍💻 Desenvolvedor
**Matheus Henrique dos Santos Silva**
* Profissional de TI focado em Field Service, suporte avançado, infraestrutura, redes e desenvolvimento full-stack.
