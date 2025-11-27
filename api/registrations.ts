import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  try {
    // Listar inscrições (GET)
    if (request.method === 'GET') {
      const { rows } = await sql`SELECT * FROM registrations ORDER BY created_at DESC;`;
      
      // Formatar para o formato esperado pelo Frontend
      const formattedRegistrations = rows.map(row => ({
        id: row.id,
        date: row.created_at,
        name: row.name,
        spouseName: row.spouse_name,
        phone: row.phone,
        spousePhone: row.spouse_phone,
        address: row.address,
        civilStatus: row.civil_status, // Postgres retorna array nativamente
        participatesInPastoral: row.participates_in_pastoral,
        pastoralName: row.pastoral_name || ''
      }));

      return response.status(200).json(formattedRegistrations);
    }

    // Criar nova inscrição (POST)
    if (request.method === 'POST') {
      const data = request.body;
      
      // Validação básica
      if (!data.name || !data.spouseName || !data.phone) {
        return response.status(400).json({ error: 'Dados obrigatórios faltando' });
      }

      await sql`
        INSERT INTO registrations (
          name, spouse_name, phone, spouse_phone, address, 
          civil_status, participates_in_pastoral, pastoral_name
        ) VALUES (
          ${data.name}, ${data.spouseName}, ${data.phone}, ${data.spousePhone}, ${data.address},
          ${data.civilStatus}, ${data.participatesInPastoral}, ${data.pastoralName}
        );
      `;

      return response.status(201).json({ message: 'Inscrição realizada com sucesso' });
    }

    return response.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database Error:', error);
    return response.status(500).json({ error: 'Erro interno no servidor' });
  }
}