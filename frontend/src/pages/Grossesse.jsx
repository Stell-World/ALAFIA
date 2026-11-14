
function Grossesse() {
  const rubriques = [
    {
      titre: 'Le suivi prénatal',
      icone: '🩺',
      contenu:
        'Le suivi prénatal permet d’accompagner la grossesse et de surveiller la santé de la mère et du bébé. Les consultations permettent notamment de poser des questions, de faire les examens recommandés et de bénéficier de conseils adaptés.',
      conseils: [
        'Prendre contact avec un professionnel de santé dès le début de la grossesse.',
        'Respecter les rendez-vous et examens recommandés.',
        'Conserver les documents médicaux et les résultats des examens.',
        'Poser ses questions au professionnel qui assure le suivi.'
      ]
    },
    {
      titre: 'Alimentation et hydratation',
      icone: '🥗',
      contenu:
        'Une alimentation variée et une hydratation suffisante participent au bien-être général pendant la grossesse. Les besoins peuvent varier selon les personnes et les situations.',
      conseils: [
        'Privilégier une alimentation variée et équilibrée.',
        'Boire régulièrement de l’eau.',
        'Demander conseil à un professionnel de santé concernant les aliments à éviter.',
        'Ne pas prendre de compléments ou de médicaments sans avis professionnel.'
      ]
    },
    {
      titre: 'Bien-être et repos',
      icone: '🌿',
      contenu:
        'Le repos, le soutien de l’entourage et un environnement rassurant peuvent contribuer au bien-être pendant cette période.',
      conseils: [
        'Accorder de l’importance au repos.',
        'Parler de ses préoccupations à une personne de confiance.',
        'Demander conseil avant de commencer une activité physique inhabituelle.',
        'Signaler au professionnel de santé toute difficulté qui inquiète.'
      ]
    },
    {
      titre: 'Les consultations',
      icone: '📅',
      contenu:
        'Les consultations permettent de faire le point sur le déroulement de la grossesse et de répondre aux questions. Leur fréquence et les examens nécessaires sont déterminés par les professionnels de santé selon la situation.',
      conseils: [
        'Préparer ses questions avant chaque consultation.',
        'Signaler les changements ou symptômes inhabituels.',
        'Suivre les recommandations données par le professionnel de santé.',
        'Ne pas remplacer une consultation par les informations trouvées en ligne.'
      ]
    }
  ];

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>Accompagnement de la grossesse</h1>

      <p style={descriptionStyle}>
        Retrouvez des informations générales pour mieux comprendre le suivi
        de la grossesse et adopter de bonnes habitudes de prévention.
      </p>

      <div style={introCardStyle}>
        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🤰</div>
        <h2 style={introTitleStyle}>Chaque grossesse mérite un suivi adapté</h2>
        <p style={introTextStyle}>
          Un accompagnement par des professionnels de santé est important
          pour répondre aux besoins de chaque personne et assurer un suivi
          adapté à sa situation.
        </p>
      </div>

      <h2 style={sectionTitleStyle}>Les informations essentielles</h2>

      <div style={gridStyle}>
        {rubriques.map((rubrique, index) => (
          <div key={index} style={cardStyle}>
            <div style={iconStyle}>{rubrique.icone}</div>

            <h3 style={cardTitleStyle}>{rubrique.titre}</h3>

            <p style={cardTextStyle}>{rubrique.contenu}</p>

            <h4 style={adviceTitleStyle}>Quelques repères</h4>

            <ul style={listStyle}>
              {rubrique.conseils.map((conseil, i) => (
                <li key={i} style={listItemStyle}>
                  {conseil}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div style={warningCardStyle}>
        <h2 style={warningTitleStyle}>Quand demander rapidement un avis médical ?</h2>

        <p style={{ lineHeight: '1.6', marginBottom: '10px' }}>
          Certains signes pendant une grossesse nécessitent une évaluation
          rapide par un professionnel de santé.
        </p>

        <ul style={listStyle}>
          <li style={listItemStyle}>
            Des saignements ou une douleur importante.
          </li>
          <li style={listItemStyle}>
            Une difficulté à respirer ou une perte de connaissance.
          </li>
          <li style={listItemStyle}>
            Une forte fièvre ou un état général qui se dégrade.
          </li>
          <li style={listItemStyle}>
            Tout symptôme inhabituel qui provoque une inquiétude importante.
          </li>
        </ul>

        <p style={{ fontWeight: '600', marginBottom: 0 }}>
          En cas de situation urgente, contactez sans attendre un service
          de santé ou les urgences locales.
        </p>
      </div>

      <p style={disclaimerStyle}>
        Ces informations sont générales et éducatives. Elles ne remplacent
        pas une consultation, un diagnostic ou les recommandations d'un
        professionnel de santé.
      </p>
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

const introCardStyle = {
  backgroundColor: '#E5F2EF',
  borderRadius: '14px',
  padding: '25px',
  textAlign: 'center',
  marginBottom: '30px'
};

const introTitleStyle = {
  color: '#173B55',
  margin: '8px 0'
};

const introTextStyle = {
  color: '#4D6260',
  lineHeight: '1.6',
  maxWidth: '650px',
  margin: '0 auto'
};

const sectionTitleStyle = {
  color: '#173B55',
  fontSize: '1.3rem',
  marginBottom: '16px'
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: '18px'
};

const cardStyle = {
  backgroundColor: '#F2F7F6',
  border: '1px solid #E8EDF2',
  borderRadius: '12px',
  padding: '20px'
};

const iconStyle = {
  fontSize: '1.8rem',
  marginBottom: '8px'
};

const cardTitleStyle = {
  color: '#173B55',
  margin: '0 0 12px'
};

const cardTextStyle = {
  color: '#555',
  fontSize: '0.92rem',
  lineHeight: '1.6'
};

const adviceTitleStyle = {
  color: '#21877C',
  marginBottom: '8px'
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

const warningCardStyle = {
  backgroundColor: '#FFF8E7',
  border: '1px solid #F0DFAE',
  borderRadius: '12px',
  padding: '20px',
  marginTop: '28px',
  color: '#725A19'
};

const warningTitleStyle = {
  color: '#725A19',
  marginTop: 0
};

const disclaimerStyle = {
  color: '#777',
  fontSize: '0.85rem',
  lineHeight: '1.5',
  marginTop: '22px',
  textAlign: 'center'
};

export default Grossesse;
