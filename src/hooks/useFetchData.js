import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const useFetchData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchData = useCallback(async (asyncFunction) => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFunction();
      return result;
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
      setError(err);
      navigate('/erro');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  return { loading, error, fetchData };
};