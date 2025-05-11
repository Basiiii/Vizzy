Resumo da Sprint 1 (17/02/2025 – 20/02/2025)
O principal objetivo desta sprint foi estabelecer uma compreensão clara do problema, do contexto e dos requisitos do sistema. A equipa realizou todas as tarefas previstas, incluindo a definição do contexto e da introdução do problema, a descrição da motivação para a solução, a documentação dos requisitos não funcionais, a criação do product backlog com user stories, detalhando cada uma em tarefas. Adicionalmente, foram definidos e documentados os processos de negócio. Todas as tarefas foram concluídas com sucesso dentro do tempo previsto, demonstrando um bom planeamento e execução. Durante a sprint review, foi validado o progresso alcançado e, em retrospetiva, foram identificados aspetos positivos, como a boa colaboração e cumprimento de prazos, e sugeridas melhorias na estimativa de tempo para algumas tarefas.

Resumo da Sprint 2 (21/02/2025 – 28/02/2025)
Esta sprint teve como principal objetivo o desenvolvimento da especificação técnica do sistema, através da criação e documentação dos diagramas exigidos. A equipa concluiu com sucesso a maioria das tarefas previstas, incluindo a criação e documentação dos diagramas de Casos de Uso, BPMN, Entidade-Relação, Classes e Sequência, bem como o diagrama de atividades e a arquitetura do sistema. Além disso, foram definidos e documentados os requisitos funcionais. A tarefa de documentação do diagrama de atividades (VIZZY-106) não foi concluída nesta sprint, ficando pendente para a próxima. De modo geral, a equipa demonstrou bom desempenho e organização, apesar de alguns desvios no tempo real de execução em tarefas específicas. Na reunião de retrospetiva, foram destacados aspetos positivos como a colaboração eficaz e a clareza dos objetivos. Foi também reconhecida a necessidade de melhorar o controlo de tempo em algumas tarefas e garantir a conclusão total do planeado.

Resumo da Sprint 3 (01/03/2025 – 09/03/2025)
O objetivo principal desta sprint foi concluir a fase de especificação do projeto, consolidando e melhorando todos os documentos e elementos visuais, tendo em vista a fase Alpha. A equipa completou com sucesso todas as tarefas planeadas. Foi finalmente documentado o diagrama de atividades que estava pendente da sprint anterior. Foram também desenvolvidos os designs das interfaces (UI), revistos e finalizados os diagramas, definido o plano de sprints para a próxima fase, e compilada a entrega final com a devida formatação. Adicionalmente, os conteúdos e diagramas foram integrados no relatório final, e a base dos projetos frontend e backend foi configurada, marcando o início da componente técnica do desenvolvimento. A equipa demonstrou elevado nível de organização e eficácia, cumprindo os prazos estabelecidos. Em retrospetiva, destacou-se a boa preparação para a próxima fase, o que reflete um planeamento sólido e colaboração consistente entre os membros.

Resumo da Alpha Sprint 1 (09/03/2025 – 13/03/2025)
Nesta sprint, o objetivo foi implementar a autenticação e a gestão de utilizadores, dando início à fase Alpha do desenvolvimento. A maioria das tarefas foi concluída com sucesso, incluindo a implementação das páginas de criar conta, login, recuperação e alteração de password, bem como a verificação de sessão e o redirecionamento adequado. No backend, foram desenvolvidos os endpoints de API para registo e obtenção da informação do utilizador, sendo também introduzida a cache com Redis para otimização do acesso a dados. A única tarefa não concluída foi a criação da barra de navegação, que ficará pendente para a próxima sprint. Apesar disso, os progressos realizados nesta fase foram significativos, com destaque para a boa integração entre frontend e backend. Na reunião de retrospetiva, foi referida a boa dinâmica de trabalho, mas também a necessidade de gerir melhor o tempo em tarefas com estimativas aparentemente subavaliadas.

Resumo da Alpha Sprint 2 (14/03/2025 – 26/03/2025)
O foco desta sprint foi a implementação da página de perfil e das definições dos utilizadores. A equipa concluiu com sucesso a maioria das tarefas previstas, incluindo a criação e dinamização da página de perfil, a implementação dos respetivos endpoints e funcionalidades complementares como alteração de idioma (i18n), layout dinâmico, rodapé (footer) e a tão aguardada barra de navegação. Foram também implementadas autenticação JWT e melhorias no backend, como a transição de .NET para NestJS e integração com caching (Redis). A criação de Docker Image para a API e endpoints para definições e perfil foram concluídas, embora algumas tarefas, como os botões e endpoints para bloquear/desbloquear utilizadores, tenham ficado por realizar e deverão transitar para a sprint seguinte. Foi ainda adicionado o botão e endpoint para apagar a conta, bem como o upload da foto de perfil. Nesta revisão, começa a notar-se alguma discrepância entre o contributo dos membros do grupo. Como ponto de melhoria, apontou-se a necessidade de melhor controlo sobre o tempo investido em tarefas com maior complexidade do que o inicialmente previsto, bem como o aumento do empenho por parte dos membros mais abaixo.

Resumo da Alpha Sprint 3 (27/03/2025 – 04/04/2025)
Durante esta sprint, a equipa concentrou-se no desenvolvimento do painel de controlo e das funcionalidades base associadas às propostas e anúncios. O painel de controlo foi criado com sucesso, incluindo separadores para anúncios, propostas e transações. Foram também implementadas as funcionalidades para submeter propostas, criar modais, e mostrar a localização do utilizador no perfil. A nível técnico, foram realizadas múltiplas tarefas de refatoração tanto no frontend como no backend, incluindo o versionamento da API, reorganização de páginas de autenticação, logging, constantes, middleware e token refresh automático. Além disso, foi criado um serviço de envio de email e endpoints relacionados com geolocalização e gestão de palavra-passe. Apesar do grande volume de trabalho realizado, algumas tarefas, como a atualização do frontend com traduções e a implementação do bloqueio de utilizadores, ficaram por concluir e serão reprogramadas. Nesta sprint, a diferença entre membros do grupo ficou ainda mais notória, tendo em conta que tarefas simples não foram concluidas a tempo.

Resumo da Alpha Sprint 4 (05/04/2025 – 13/04/2025)
Esta sprint teve como principal objetivo a conclusão das funcionalidades associadas a propostas e anúncios, bem como a documentação e organização final do código antes do fecho do ciclo alpha. Foram implementadas várias funcionalidades críticas como: submissão e gestão completa de propostas (aceitar, rejeitar, cancelar, visualizar, anexar imagens), criação e visualização de anúncios (incluindo modais distintos por tipo), upload de imagens e filtros no painel de controlo. Foi também desenvolvida uma pesquisa avançada na página de marketplace, fortalecendo a experiência do utilizador. A nível técnico, foram realizadas importantes tarefas de refatoração e documentação de controladores e serviços de backend, além da disponibilização pública da aplicação com o alojamento do frontend e backend. A documentação foi atualizada e enriquecida com Swagger. Algumas tarefas de menor prioridade, como a implementação de favoritos e a aplicação de traduções no frontend, não foram concluídas. No geral, a sprint demonstrou uma forte maturidade do produto e de parte da equipa, uma vez que as tarefas mais simples, atribuídas aos elementos com maior dificuldade, não foram concluídas, não tendo os mesmos demonstrado qualquer tipo de problema com a situação, nem prestado atenção à ajuda que a restante equipa tentou proporcionar.

Resumo da Beta Sprint 1 (15/04/2025 – 20/04/2025)
Esta sprint teve como objetivo principal a refatoração e estabilização do sistema, preparando a base para os próximos desenvolvimentos da fase beta. A equipa concentrou-se em corrigir bugs identificados, limpar e otimizar o código, melhorar a organização de componentes e serviços e implementar boas práticas como caching, paginação e rate limiting.
Foi feito um trabalho significativo no backend (refatoração de controladores, serviços, RPCs, cache, CI/CD, e endpoints) e no frontend (ajustes visuais, correções no dashboard, componentes reativos e melhorias na navegação e UX).
Destacam-se também a integração de ferramentas automáticas de revisão de código (Codacy, Danger JS), melhorias de performance e a visualização do saldo do utilizador.
No entanto, algumas tarefas pendentes da fase alpha, como o sistema de favoritos e a tradução de páginas, continuam por implementar. Mais uma vez, os membros responsáveis por estas tarefas não se demonstraram incomodados com a situação.

A sprint cumpriu o seu papel de fortalecer a robustez do produto e eliminar dívidas técnicas, consolidando uma base sólida para novas funcionalidades beta.

Resumo da Beta Sprint 2
A Sprint 2 teve como principal objetivo a implementação de testes de desempenho e de integração, além de focar na limpeza e refatoração do frontend. A sprint foi muito orientada a garantir a estabilidade do sistema e otimizar o desempenho, com a realização de testes em várias áreas cruciais como propostas, utilizadores, anúncios e contactos. Além disso, a refatoração de componentes e correção de bugs no frontend foi uma prioridade, com diversas melhorias no processo de upload de avatar, dados de perfil e interação com o backend.

Entre os destaques da sprint, temos a implementação de testes de desempenho para propostas, utilizadores e anúncios, além de testes de integração para componentes-chave do sistema. A limpeza do código foi complementada com ajustes de segurança, como a refatoração dos cookies de autenticação e documentação de endpoints com Swagger e JSdoc.

Também houve um trabalho contínuo para melhorar a experiência do utilizador no frontend, com correções de bugs de produção no Vercel, além da correção de funcionalidades do perfil de utilizador e ações no frontend. Em termos de backend, foram feitas diversas melhorias relacionadas ao cache e endpoints de propostas.

Resumo da RTW Sprint 1
O principal objetivo da Sprint 1 foi finalizar o backend e polir a aplicação, com foco em adicionar funcionalidades importantes para melhorar a experiência do utilizador. Durante essa sprint, várias tarefas foram realizadas, incluindo:

Refatorações e ajustes no frontend e backend:

Implementação de funcionalidades de atualizar e apagar anúncios no frontend e backend.

Criação de endpoints para atualizar e apagar anúncios, além de adicionar informações do utilizador na página de anúncios.

Melhorias nas traduções:

Tradução das restantes páginas para garantir consistência na aplicação.

Atualização das traduções de estado de produto, melhorando a experiência do utilizador.

Correções de Bugs:

Vários ajustes de UI/UX, como a adição de informações do utilizador à página de anúncios e a exibição de imagens nos detalhes das propostas.

Além disso, alguns tickets não foram feitos durante a sprint, como a criação de endpoints para marcar/desmarcar anúncios de favoritos e os testes de integração para trocar a palavra-passe.
Mais uma vez, os responsáveis pelas tarefas não concluidas, não mostraram qualquer interesse em tentar resolver a situação.

Resumo da RTW Sprint 1
O principal objetivo desta sprint foi finalizar os diagramas, a documentação e iniciar a criação de conteúdo promocional. A equipa concluiu a maioria das tarefas planeadas, incluindo a atualização dos principais diagramas do sistema (Entidade-Relação, Classes, BPMN) e a funcionalidade de atualizar anúncios.

Algumas tarefas ainda permanecem em progresso ou por iniciar, como os testes de integração para alteração de palavra-passe e a funcionalidade de favoritos no frontend e backend, o que indica um grande desfasamento face ao planeado. Destaca-se o empenho de alguns membros da equipa na execução das tarefas atribuídas, evidenciado pelo volume significativo de itens concluídos. No entanto, continuam a registar-se graves assimetrias na entrega por parte de alguns elementos.

Em retrospetiva, foram reconhecidos os progressos alcançados em tarefas críticas para a entrega final, mas sublinhada a necessidade de melhor distribuir o esforço entre os membros da equipa e garantir o fecho das tarefas iniciadas, especialmente tendo em conta que esta é fase final do projeto.
