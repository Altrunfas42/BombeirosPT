# 🔥 BombeirosPT — Plataforma Inteligente de Prevenção de Incêndios

## 📚 Documentação
A proposta completa do projeto encontra-se disponível na pasta `/Documentacao`.

---

## 📌 Sobre o Projeto

O **BombeirosPT** é uma plataforma web desenvolvida no âmbito do Trabalho Final de Curso em Engenharia Informática, com o objetivo de melhorar a **prevenção, monitorização e gestão de incêndios florestais em Portugal**.

A aplicação permite a interação entre **cidadãos e bombeiros**, através de um sistema centralizado com **mapa interativo em tempo real**, onde é possível:

- Criar pedidos de queima controlada  
- Reportar situações de risco  
- Visualizar ocorrências georreferenciadas  
- Gerir estados dos pedidos (pendente, aprovado, rejeitado)  

---

## 🎯 Problema

Atualmente, os sistemas de gestão de incêndios apresentam limitações como:

- Falta de comunicação direta entre cidadãos e autoridades  
- Ausência de plataformas interativas de reporte  
- Informação fragmentada e não centralizada  
- Processos manuais e pouco eficientes  

O BombeirosPT propõe resolver este problema através de uma plataforma digital integrada e acessível.

---

## 🚀 Funcionalidades

### 👤 Cidadão
- Registo e login  
- Criar pedidos diretamente no mapa  
- reporte de situações de risco  
- consulta de ocorrências   

### 🚒 Bombeiro
- Registo e login
- Visualizar todos os pedidos no mapa  
- Aprovar ou rejeitar pedidos  
- Monitorizar prioridades e estados  
- Aceder a informação detalhada  

---

## 🧱 Arquitetura do Sistema


Frontend (React + Leaflet)
↓
Backend API (Node.js + Express)
↓
Base de Dados (MySQL + Prisma)


---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React, Leaflet  
- **Backend:** Node.js, Express  
- **Base de Dados:** MySQL + Prisma  
- **Autenticação:** JWT + bcrypt  
- **Mapas:**  Leaflet  

---

## 📂 Estrutura do Projeto


bombeirospt/
│
├── backend/
│ ├── src/
│ │ ├── routes/
│ │ ├── middlewares/
│ │ ├── prisma.js
│ │ ├── app.js
│ │ └── server.js
│ ├── prisma/
│ │ └── schema.prisma
│
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ ├── services/
│ │ └── App.jsx
│
├── docs/
│ └── proposta.pdf
│
└── README.md


---

## ⚙️ Instalação e Execução

### 🔧 Backend

```bash
cd backend
npm install

Criar ficheiro .env:

Executar:

npx prisma migrate dev
npx prisma generate
npm run dev

💻 Frontend
cd frontend
npm install
npm run dev

🔐 Autenticação
O sistema utiliza JWT (JSON Web Tokens):

Token guardado no localStorage
Enviado nas requests:
Authorization: Bearer TOKEN

📊 Estados dos Pedidos
Estado	Descrição
PENDING	Pedido em análise
APPROVED	Pedido aprovado
REJECTED	Pedido rejeitado

📍 Mapa Interativo
Baseado em Leaflet + OpenStreetMap
Permite:
Criar pedidos ao clicar no mapa
Visualizar ocorrências em tempo real
Diferenciar prioridades e estados

📈 Roadmap / Milestones
Milestone	Descrição
M1	Backend + autenticação
M2	API de pedidos
M3	Mapa interativo
M4	Dashboard
M5	Integração com APIs externas
M6	Documentação final

⚠️ Riscos
APIs externas indisponíveis → uso de dados simulados
Problemas de integração → testes contínuos
Sobrecarga académica → foco no MVP

🔮 Trabalhos Futuros
Integração com dados do IPMA
Sistema de alertas em tempo real
Machine Learning para previsão de risco
Dashboard avançado
Notificações
