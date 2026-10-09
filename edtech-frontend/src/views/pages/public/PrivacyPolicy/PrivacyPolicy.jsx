import React, { useEffect, useState } from 'react';
import api from '../../../../models/services/api';
import PolicyDocument from '../../../components/policy/PolicyDocument';
import Loader from '../../../components/common/Loader/Loader';

const pageStyle = {
  maxWidth: '820px',
  margin: '0 auto',
  padding: 'var(--space-16) var(--space-6)',
};

// Public page: reachable without logging in (linked from Register and the footer).
const PrivacyPolicy = () => {
  const [policy, setPolicy] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Privacy Policy | Study Wisely';
    api
      .get('/policies/customer')
      .then((res) => setPolicy(res.data))
      .catch((err) =>
        setError(
          err.response?.status === 404
            ? 'The privacy policy is not available right now.'
            : 'Could not load the privacy policy. Please try again later.'
        )
      );
  }, []);

  return (
    <div style={pageStyle}>
      {error && <p style={{ color: 'var(--color-text-secondary)' }}>{error}</p>}
      {!error && !policy && <Loader text="Loading privacy policy..." />}
      {policy && <PolicyDocument policy={policy} />}
    </div>
  );
};

export default PrivacyPolicy;
