import createConnectionPool, { sql } from '@databases/pg';

export { sql };

const db = createConnectionPool({
  onQueryStart: (_query, { text, values }) => {
    console.log(
      `${new Date().toISOString()} START QUERY ${text} - ${JSON.stringify(
        values,
      )}`,
    );
  },
  onQueryResults: (_query, { text }, results) => {
    console.log(
      `${new Date().toISOString()} END QUERY   ${text} - ${
        results.length
      } results`,
    );
  },
  onQueryError: (_query, { text }, err) => {
    console.log(
      `${new Date().toISOString()} ERROR QUERY ${text} - ${err.message}`,
    );
  },
});

export default db;
