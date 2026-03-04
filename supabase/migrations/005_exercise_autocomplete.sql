-- Exercise autocomplete: trainer'ın daha önce kullandığı egzersiz isimlerini arar
CREATE OR REPLACE FUNCTION search_exercises(p_trainer_id UUID, p_query TEXT, p_limit INT DEFAULT 10)
RETURNS TABLE(name TEXT, frequency BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT we.name, COUNT(*) as frequency
  FROM workout_exercises we
  JOIN workouts w ON w.id = we.workout_id
  WHERE w.trainer_id = p_trainer_id
    AND we.name ILIKE '%' || p_query || '%'
  GROUP BY we.name
  ORDER BY frequency DESC
  LIMIT p_limit;
$$;
