# Agenda.com - Vicky Sampaio Makeup

## Visão Geral

Agenda.com é um sistema de agendamento de serviços simplificado de próxima geração, projetado com uma abordagem "Mobile-First" e "Anti-SaaS". Este projeto específico é uma implementação para a **Vicky Sampaio Makeup**, focando em uma experiência de usuário sem atritos, semelhante ao "Link-in-Bio", mas com lógica de comércio de serviços robusta.

## Funcionalidades Principais

*   **Agendamento Simplificado**: Fluxo de reserva intuitivo (Selecionar Serviço -> Profissional -> Horário -> Identificação).
*   **Carrinho de Serviços (Smart Cart)**: Permite adicionar múltiplos serviços (ex: Corte + Barba) com cálculo automático de duração e preço.
*   **Destaques com Slideshow**: Visualização atraente dos combos e serviços principais com animações.
*   **Programa de Fidelidade**: Cartão de fidelidade digital integrado com gamificação visual.
*   **Integração com IA (Gemini)**: "Recepcionista Virtual" alimentado pela API Google Gemini para tirar dúvidas sobre serviços, horários e regras.
*   **Modo Admin**: Dashboard administrativo com gráficos e KPIs para acompanhamento de receitas e desempenho da equipe.
*   **Tema Escuro (Dark Mode)**: Suporte nativo a modo claro e escuro com transições suaves.

## Tecnologias Utilizadas

*   **Frontend**: React 19, TypeScript
*   **Estilização**: Tailwind CSS (via CDN)
*   **IA**: Google GenAI SDK (`@google/genai`)
*   **Gráficos**: Recharts
*   **Ícones**: SVGs inline

## Como Executar

Este projeto foi construído para rodar em ambientes modernos que suportam ES Modules.

1.  Clone este repositório.
2.  Configure a chave de API do Google Gemini (`API_KEY`) no seu ambiente de execução.
3.  Sirva os arquivos estáticos.
    *   Exemplo: `npx serve .`
4.  Acesse a aplicação no navegador.

## Estrutura do Projeto

*   `components/`: Componentes da interface (ClientView, AdminView, Cards, etc).
*   `services/`: Serviços de integração (Gemini AI).
*   `types.ts`: Definições de tipos TypeScript.
*   `constants.ts`: Dados simulados (Serviços, Profissionais, Horários).
*   `App.tsx`: Componente raiz e gerenciamento de estado global.
