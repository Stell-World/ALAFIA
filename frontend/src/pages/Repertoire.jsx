
import { useState } from 'react';

const professionnels = [
  {
    id: 1,
    nom: 'Dr Exemple A',
    specialite: 'Médecine générale',
    description:
      'Profil de démonstration présentant un professionnel de santé en médecine générale.'
  },
  {
    id: 2,
    nom: 'Dr Exemple B',
    specialite: 'Pédiatrie',
    description:
      'Profil de démonstration consacré au suivi de la santé des enfants.'
  },
  {
    id: 3,
    nom: 'Dr Exemple C',
    specialite: 'Gynécologie',
    description:
      'Profil de démonstration consacré à la santé reproductive et au suivi gynécologique.'
  },
  {
    id: 4,
    nom: 'Dr Exemple D',
    specialite: 'Dentisterie',
    description:
      'Profil de démonstration consacré à la prévention et à la santé bucco-dentaire.'
  },
  {
    id: 5,
    nom: 'Dr Exemple E',
    specialite: 'Dermatologie',
    description:
      'Profil de démonstration consacré à la santé de la peau.'
  },
  {
    id: 6,
    nom: 'Dr Exemple F',
    specialite: 'Cardiologie',
    description:
      'Profil de démonstration consacré à la santé cardiovasculaire.'
  }
];

function Repertoire() {
  const [recherche, setRecherche] = useState('');

  const specialites = [
    'Toutes les spécialités',
    ...new Set(professionnels.map((p) => p.specialite))
  ];

  const professionnelsFiltres = professionnels.filter((professionnel) => {
    return (
      professionnel.specialite
        .toLowerCase()
        .includes(recherche.toLowerCase()) ||
      professionnel.nom.toLowerCase().includes(recherche.toLowerCase())
    );
  });

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>Répertoire des professionnels</h1>

      <p style={descriptionStyle}>
        Découvrez les différentes catégories de professionnels de santé.
        Ce répertoire présente des profils fictifs à titre de démonstration.
      </p>

      <div style={noticeStyle}>
        <strong>Information importante :</strong> les profils présentés
        ci-dessous sont fictifs. Ils ne correspondent pas à des professionnels
        réellement identifiés ou vérifiés.
      </div>

      <div style={searchCardStyle}>
        <h2 style={subtitleStyle}>Rechercher un professionnel</h2>

        <input
          type="text"
          placeholder="Rechercher par nom ou spécialité..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          style={inputStyle}
        />

        <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {specialites.map((specialite) => (
            <button
              key={specialite}
              type="button"
              onClick={() =>
                setRecherche(
                  specialite === 'Toutes les spécialités' ? '' : specialite
                )
              }
              style={{
                ...filterButtonStyle,
                backgroundColor:
                  recherche === specialite ||
                  (specialite === 'Toutes les spécialités' && recherche === '')
                    ? '#21877C'
                    : '#E8EDF2',
                color:
                  recherche === specialite ||
                  (specialite === 'Toutes les spécialités' && recherche === '')
                    ? 'white'
                    : '#173B55'
              }}
            >
              {specialite}
            </button>
          ))}
        </div>
      </div>

      <h2 style={subtitleStyle}>Les profils disponibles</h2>

      {professionnelsFiltres.length === 0 ? (
        <p style={emptyStyle}>
          Aucun profil ne correspond à votre recherche.
        </p>
      ) : (
        <div style={gridStyle}>
          {professionnelsFiltres.map((professionnel) => (
            <div key={professionnel.id} style={profileCardStyle}>
              <div style={avatarStyle}>
                {professionnel.nom.charAt(0)}
              </div>

              <h3 style={profileNameStyle}>{professionnel.nom}</h3>

              <span style={specialtyBadgeStyle}>
                {professionnel.specialite}
              </span>

              <p style={profileDescriptionStyle}>
                {professionnel.description}
              </p>

              <p style={fakeProfileStyle}>
                Profil fictif – données de démonstration
              </p>
            </div>
          ))}
        </div>
      )}
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
  marginBottom: '20px',
  fontSize: '0.95rem',
  lineHeight: '1.6'
};

const noticeStyle = {
  backgroundColor: '#FFF8E7',
  border: '1px solid #F0DFAE',
  color: '#725A19',
  padding: '14px',
  borderRadius: '10px',
  marginBottom: '24px',
  lineHeight: '1.5'
};

const searchCardStyle = {
  backgroundColor: '#F2F7F6',
  border: '1px solid #E8EDF2',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '28px'
};

const subtitleStyle = {
  color: '#173B55',
  fontSize: '1.2rem',
  marginTop: 0,
  marginBottom: '14px'
};

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid #ccc',
  fontSize: '1rem'
};

const filterButtonStyle = {
  border: 'none',
  borderRadius: '20px',
  padding: '8px 12px',
  cursor: 'pointer',
  fontSize: '0.85rem'
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
  gap: '16px'
};

const profileCardStyle = {
  backgroundColor: '#F2F7F6',
  border: '1px solid #E8EDF2',
  borderRadius: '12px',
  padding: '20px',
  textAlign: 'center'
};

const avatarStyle = {
  width: '55px',
  height: '55px',
  borderRadius: '50%',
  backgroundColor: '#21877C',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.4rem',
  fontWeight: 'bold',
  margin: '0 auto 12px'
};

const profileNameStyle = {
  color: '#173B55',
  margin: '8px 0'
};

const specialtyBadgeStyle = {
  display: 'inline-block',
  backgroundColor: '#DCEFEB',
  color: '#17675F',
  padding: '6px 10px',
  borderRadius: '20px',
  fontSize: '0.85rem'
};

const profileDescriptionStyle = {
  color: '#555',
  lineHeight: '1.5',
  fontSize: '0.9rem',
  marginTop: '14px'
};

const fakeProfileStyle = {
  color: '#888',
  fontSize: '0.78rem',
  borderTop: '1px solid #E8EDF2',
  paddingTop: '12px',
  marginBottom: 0
};

const emptyStyle = {
  color: '#777',
  padding: '20px',
  textAlign: 'center'
};

export default Repertoire;
