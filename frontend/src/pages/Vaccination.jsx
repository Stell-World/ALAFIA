
function Vaccination() {
  const informations = [
    {
      titre: 'Pourquoi se faire vacciner ?',
      icone: '🛡️',
      texte:
        'La vaccination aide l’organisme à développer une protection contre certaines maladies infectieuses. Elle contribue également à réduire la circulation de certaines maladies dans la population.'
    },
    {
      titre: 'Le carnet de vaccination',
      icone: '📘',
      texte:
        'Le carnet de vaccination permet de conserver une trace des vaccins reçus. Il facilite le suivi et aide les professionnels de santé à vérifier les informations lors des consultations.'
    },
    {
      titre: 'Le suivi vaccinal',
      icone: '📅',
      texte:
        'Les recommandations vaccinales dépendent notamment de l’âge, de la situation personnelle et du contexte sanitaire. Un professionnel de santé ou un service de vaccination peut aider à faire le point.'
    }
  ];

  const questions = [
    {
      question: 'Où puis-je obtenir des informations sur les vaccins ?',
      reponse:
        'Vous pouvez vous adresser à un centre de santé, à un service de vaccination ou à un professionnel de santé. Ils pourront vous communiquer les recommandations applicables dans votre situation.'
    },
    {
      question: 'Que faire si j’ai perdu mon carnet de vaccination ?',
      reponse:
        'Contactez le centre de santé ou le professionnel qui a réalisé les vaccinations précédentes. Il pourra vous indiquer si des informations peuvent être retrouvées et quelles démarches effectuer.'
    },
    {
      question: 'Dois-je suivre le même calendrier vaccinal que tout le monde ?',
      reponse:
        'Les recommandations peuvent varier selon plusieurs facteurs. Il est préférable de faire vérifier sa situation par un professionnel de santé plutôt que de se baser uniquement sur un calendrier trouvé en ligne.'
    }
  ];

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>Vaccination et prévention</h1>

      <p style={descriptionStyle}>
        Comprendre l'importance de la vaccination, conserver ses informations
        et s'informer auprès des services de santé compétents.
      </p>

      <div style={bannerStyle}>
        <div style={{ fontSize: '2.2rem', marginBottom: '8px' }}>💉</div>

        <h2 style={bannerTitleStyle}>
          La vaccination, un geste de prévention
        </h2>

        <p style={bannerTextStyle}>
          S'informer et tenir à jour son suivi vaccinal contribue à la
          prévention de certaines maladies infectieuses.
        </p>
      </div>

      <h2 style={sectionTitleStyle}>L'essentiel à connaître</h2>

      <div style={gridStyle}>
        {informations.map((info, index) => (
          <div key={index} style={infoCardStyle}>
            <div style={iconStyle}>{info.icone}</div>
            <h3 style={cardTitleStyle}>{info.titre}</h3>
            <p style={cardTextStyle}>{info.texte}</p>
          </div>
        ))}
      </div>

      <div style={recordCardStyle}>
        <div style={{ fontSize: '1.8rem' }}>📋</div>

        <div style={{ flex: 1 }}>
          <h2 style={recordTitleStyle}>Bien conserver son suivi vaccinal</h2>

          <p style={cardTextStyle}>
            Quelques habitudes simples peuvent faciliter le suivi de ses
            vaccinations :
          </p>

          <ul style={listStyle}>
            <li style={listItemStyle}>
              Conserver son carnet de vaccination dans un endroit sûr.
            </li>
            <li style={listItemStyle}>
              Présenter son carnet lors des consultations.
            </li>
            <li style={listItemStyle}>
              Faire vérifier les informations par un professionnel de santé.
            </li>
            <li style={listItemStyle}>
              Demander conseil en cas de doute ou d'information manquante.
            </li>
          </ul>
        </div>
      </div>

      <h2 style={sectionTitleStyle}>Questions fréquentes</h2>

      <div style={{ display: 'grid', gap: '12px' }}>
        {questions.map((item, index) => (
          <details key={index} style={faqStyle}>
            <summary style={questionStyle}>
              {item.question}
            </summary>

            <p style={answerStyle}>
              {item.reponse}
            </p>
          </details>
        ))}
      </div>

      <div style={noticeStyle}>
        <strong>À retenir :</strong> cette page fournit des informations
        générales. Elle ne constitue pas un calendrier vaccinal officiel
        ni un avis médical personnalisé. Pour connaître les vaccins
        recommandés et les dates adaptées à votre situation, adressez-vous
        à un professionnel de santé ou à un service de vaccination.
      </div>
    </div>
  );
}

const pageStyle = {
  maxWidth: '1000px',
  margin: '0 auto',
  padding: '20px'
};

const titleStyle = {
  color: '#173B55',
  marginBottom: '35px'
};

const descriptionStyle = {
  color: '#555',
  fontSize: '0.95rem',
  lineHeight: '1.6',
  marginBottom: '24px'
};

const bannerStyle = {
  backgroundColor: '#E5F2EF',
  borderRadius: '14px',
  padding: '28px',
  textAlign: 'center',
  marginBottom: '30px'
};

const bannerTitleStyle = {
  color: '#173B55',
  margin: '8px 0'
};

const bannerTextStyle = {
  color: '#4D6260',
  lineHeight: '1.6',
  maxWidth: '650px',
  margin: '0 auto'
};

const sectionTitleStyle = {
  color: '#173B55',
  fontSize: '1.3rem',
  marginBottom: '16px',
  marginTop: '28px'
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
  gap: '16px'
};

const infoCardStyle = {
  backgroundColor: '#F2F7F6',
  border: '1px solid #E8EDF2',
  borderRadius: '12px',
  padding: '20px'
};

const iconStyle = {
  fontSize: '1.8rem',
  marginBottom: '10px'
};

const cardTitleStyle = {
  color: '#173B55',
  margin: '0 0 10px'
};

const cardTextStyle = {
  color: '#555',
  fontSize: '0.92rem',
  lineHeight: '1.6'
};

const recordCardStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '16px',
  backgroundColor: '#F2F7F6',
  border: '1px solid #E8EDF2',
  borderRadius: '12px',
  padding: '20px',
  marginTop: '28px'
};

const recordTitleStyle = {
  color: '#173B55',
  marginTop: 0
};

const listStyle = {
  paddingLeft: '20px',
  marginBottom: 0
};

const listItemStyle = {
  color: '#555',
  lineHeight: '1.6',
  marginBottom: '7px'
};

const faqStyle = {
  backgroundColor: '#F2F7F6',
  border: '1px solid #E8EDF2',
  borderRadius: '10px',
  padding: '16px'
};

const questionStyle = {
  color: '#173B55',
  fontWeight: '600',
  cursor: 'pointer'
};

const answerStyle = {
  color: '#555',
  lineHeight: '1.6',
  marginBottom: 0,
  marginTop: '12px'
};

const noticeStyle = {
  backgroundColor: '#FFF8E7',
  border: '1px solid #F0DFAE',
  color: '#725A19',
  padding: '16px',
  borderRadius: '10px',
  marginTop: '28px',
  lineHeight: '1.6'
};

export default Vaccination;
