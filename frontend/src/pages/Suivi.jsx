import { useState, useEffect } from 'react';

const STORAGE_KEY = 'santeplus-suivis';

function Suivi() {
  const [suivis, setSuivis] = useState(() => {
  try {
    const donnees = localStorage.getItem(STORAGE_KEY);
    return donnees ? JSON.parse(donnees) : [];
  } catch (erreur) {
    console.error("Erreur lors du chargement :", erreur);
    return [];
  }
});
  const [nouveauSuivi, setNouveauSuivi] = useState('');
  const [mesure, setMesure] = useState({
    suiviId: '',
    nom: '',
    valeur: '',
    unite: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Charger les données au démarrage
  

  // Sauvegarder à chaque changement
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(suivis));
  }, [suivis]);

  // Créer un nouveau suivi
  const creerSuivi = (e) => {
    e.preventDefault();
    if (!nouveauSuivi.trim()) return;

    const nouveau = {
      id: Date.now().toString(),
      titre: nouveauSuivi.trim(),
      mesures: []
    };

    setSuivis([...suivis, nouveau]);
    setNouveauSuivi('');
  };

  // Ajouter une mesure
  const ajouterMesure = (e) => {
    e.preventDefault();
    if (!mesure.suiviId || !mesure.nom.trim() || !mesure.valeur.trim()) return;

    const nouvelleMesure = {
      id: Date.now().toString(),
      nom: mesure.nom.trim(),
      valeur: mesure.valeur.trim(),
      unite: mesure.unite.trim(),
      date: mesure.date
    };

    setSuivis(
      suivis.map((s) =>
        s.id === mesure.suiviId
          ? { ...s, mesures: [...s.mesures, nouvelleMesure] }
          : s
      )
    );

    setMesure({
      suiviId: '',
      nom: '',
      valeur: '',
      unite: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  // Supprimer un suivi
  const supprimerSuivi = (id) => {
    if (window.confirm('Supprimer ce suivi et toutes ses mesures ?')) {
      setSuivis(suivis.filter((s) => s.id !== id));
    }
  };

  // Supprimer une mesure
  const supprimerMesure = (suiviId, mesureId) => {
    setSuivis(
      suivis.map((s) =>
        s.id === suiviId
          ? { ...s, mesures: s.mesures.filter((m) => m.id !== mesureId) }
          : s
      )
    );
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ color: '#173B55', marginBottom: '35px' }}>Mon suivi personnel</h1>
      <p style={{ color: '#555', marginBottom: '24px', fontSize: '0.95rem' }}>
        Cet espace vous permet de noter des informations utiles pour votre suivi.
        <br />
        <strong>Attention :</strong> les données sont stockées uniquement sur cet appareil (localStorage).
        Ce n’est <u>pas</u> un dossier médical sécurisé.
      </p>

      {/* Formulaire créer un suivi */}
      <div style={cardStyle}>
        <h2 style={subtitleStyle}>Créer un suivi</h2>
        <form onSubmit={creerSuivi} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Ex: Poids, Tension, Symptômes..."
            value={nouveauSuivi}
            onChange={(e) => setNouveauSuivi(e.target.value)}
            style={inputStyle}
          />
          <button type="submit" style={buttonStyle}>
            Créer
          </button>
        </form>
      </div>

      {/* Formulaire ajouter une mesure */}
      {suivis.length > 0 && (
        <div style={cardStyle}>
          <h2 style={subtitleStyle}>Ajouter une mesure</h2>
          <form onSubmit={ajouterMesure} style={{ display: 'grid', gap: '12px' }}>
            <select
              value={mesure.suiviId}
              onChange={(e) => setMesure({ ...mesure, suiviId: e.target.value })}
              style={inputStyle}
              required
            >
              <option value="">Choisir un suivi</option>
              {suivis.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.titre}
                </option>
              ))}
            </select>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Nom (ex: Poids)"
                value={mesure.nom}
                onChange={(e) => setMesure({ ...mesure, nom: e.target.value })}
                style={{ ...inputStyle, flex: 1 }}
                required
              />
              <input
                type="text"
                placeholder="Valeur"
                value={mesure.valeur}
                onChange={(e) => setMesure({ ...mesure, valeur: e.target.value })}
                style={{ ...inputStyle, width: '100px' }}
                required
              />
              <input
                type="text"
                placeholder="Unité (kg, mmHg...)"
                value={mesure.unite}
                onChange={(e) => setMesure({ ...mesure, unite: e.target.value })}
                style={{ ...inputStyle, width: '120px' }}
              />
            </div>

            <input
              type="date"
              value={mesure.date}
              onChange={(e) => setMesure({ ...mesure, date: e.target.value })}
              style={inputStyle}
            />

            <button type="submit" style={buttonStyle}>
              Ajouter la mesure
            </button>
          </form>
        </div>
      )}

      {/* Liste des suivis */}
      <div style={{ marginTop: '32px' }}>
        <h2 style={subtitleStyle}>Mes suivis</h2>

        {suivis.length === 0 ? (
          <p style={{ color: '#777' }}>Aucun suivi pour le moment. Créez-en un ci-dessus.</p>
        ) : (
          suivis.map((suivi) => (
            <div key={suivi.id} style={{ ...cardStyle, marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: '#173B55' }}>{suivi.titre}</h3>
                <button
                  onClick={() => supprimerSuivi(suivi.id)}
                  style={{ ...buttonStyle, backgroundColor: '#c0392b', padding: '6px 12px' }}
                >
                  Supprimer
                </button>
              </div>

              {suivi.mesures.length === 0 ? (
                <p style={{ color: '#888', marginTop: '12px' }}>Aucune mesure enregistrée.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, marginTop: '12px' }}>
                  {suivi.mesures
                    .slice()
                    .reverse()
                    .map((m) => (
                      <li
                        key={m.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 0',
                          borderBottom: '1px solid #E8EDF2'
                        }}
                      >
                        <span>
                          <strong>{m.nom}</strong> : {m.valeur} {m.unite}
                          <span style={{ color: '#888', marginLeft: '10px', fontSize: '0.9rem' }}>
                            ({m.date})
                          </span>
                        </span>
                        <button
                          onClick={() => supprimerMesure(suivi.id, m.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#c0392b',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                          }}
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Styles simples
const cardStyle = {
  backgroundColor: '#F2F7F6',
  border: '1px solid #E8EDF2',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '20px'
};

const subtitleStyle = {
  color: '#173B55',
  fontSize: '1.2rem',
  marginTop: 0,
  marginBottom: '14px'
};

const inputStyle = {
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #ccc',
  fontSize: '1rem',
  minWidth: '180px'
};

const buttonStyle = {
  backgroundColor: '#21877C',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  padding: '10px 18px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '0.95rem'
};

export default Suivi;