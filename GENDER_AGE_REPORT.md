# 📊 GENDER AGE REPORT - Novos Gráficos de Relatórios

**Data:** 02/05/2026  
**Projeto:** GVC - Gerenciador de Visitante Cultural

---

## 📊 Resumo das Alterações

| Verificação | Status |
|-------------|--------|
| Gráfico de Gênero (PieChart) | ✅ |
| Gráfico de Faixa Etária (BarChart) | ✅ |
| Filtros integrados | ✅ |
| TypeScript | ✅ |
| Build | ✅ |

---

## 1. Novos Gráficos Adicionados

### 1.1 Gráfico de Gênero (PieChart)

**Arquivo:** `src/components/pages/Reports.tsx`

```tsx
// Estrutura do componente
<div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">
    Visitantes por Gênero
  </h3>
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={genderData}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        outerRadius={100}
        fill="#8884d8"
        dataKey="value"
      >
        {genderData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
      <Tooltip formatter={(value: number) => [`${value} visitantes`, 'Quantidade']} />
      <Legend />
    </PieChart>
  </ResponsiveContainer>
</div>
```

**Dados processados:**
| Gênero | Cor |
|--------|-----|
| Masculino | #3B82F6 (Blue) |
| Feminino | #EC4899 (Pink) |
| Não informado | #9CA3AF (Gray) |

---

### 1.2 Gráfico de Faixa Etária (BarChart)

```tsx
<div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">
    Visitantes por Faixa Etária
  </h3>
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={ageData}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} />
      <XAxis angle={-45} textAnchor="end" height={60} />
      <YAxis />
      <Tooltip />
      <Bar dataKey="value" fill="#6366F1" radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
</div>
```

**Faixas etárias:**
| Faixa | Código |
|-------|--------|
| 0-12 anos | Infantil |
| 13-17 anos | Adolescente |
| 18-24 anos | Jovem Adulto |
| 25-35 anos | Adulto |
| 36-50 anos | Meia-idade |
| 51-65 anos | Senior |
| 66+ anos | Idoso |
| Não informado | Sem dados |

---

## 2. Funções de Consulta

### 2.1 fetchGenderAndAgeData()

```typescript
const fetchGenderAndAgeData = async () => {
  // 1. Buscar visitas no período e localização
  let visitsQuery = supabase.from('visits').select('visitor_id, espaco_id, checkin')
    .gte('checkin', startDate)
    .lte('checkin', endDate);

  if (filterLocation !== 'Todos os Locais') {
    visitsQuery = visitsQuery.eq('espaco_id', filterLocation);
  }

  // 2. Obter IDs únicos de visitantes
  const visitorIds = [...new Set(visitsData.map(v => v.visitor_id))];

  // 3. Buscar dados dos visitantes
  const { data: visitorsData } = await supabase
    .from('visitors')
    .select('id, gender, birth_date')
    .in('id', visitorIds);

  // 4. Processar gênero
  visitorsData.forEach(v => {
    if (v.gender === 'Masculino') genderCounts['Masculino']++;
    else if (v.gender === 'Feminino') genderCounts['Feminino']++;
    else genderCounts['Não informado']++;
  });

  // 5. Processar faixa etária
  visitorsData.forEach(v => {
    if (v.birth_date) {
      const age = calculateAge(v.birth_date);
      // Classificar na faixa correspondente
    } else {
      ageGroups['Não informado']++;
    }
  });
};
```

---

## 3. Tratamento de Dados Nulos

| Campo | Valor Nulo | Tratamento |
|-------|------------|-------------|
| gender | null / undefined | "Não informado" (cor cinza) |
| birth_date | null / undefined | "Não informado" na faixa etária |

---

## 4. Integração com Filtros Existentes

Os gráficos respeitam os filtros:

| Filtro | Comportamento |
|--------|---------------|
| Data Inicial | Considera apenas visitas com checkin >= startDate |
| Data Final | Considera apenas visitas com checkin <= endDate |
| Localização | Filtra por espaco_id (espaço específico ou todos) |
| Perfil | Não afeta os gráficos (dados do visitante) |
| Status | Não afeta os gráficos (dados do visitante) |

---

## 5. Testes Mentais

| Cenário | Resultado |
|---------|-----------|
| Filtro: Todos os locais, Todas as datas | Gráficos com dados totais |
| Filtro: Local específico | Gráficos apenas daquele espaço |
| Filtro: Data inicial e final | Gráficos apenas do período |
| Visitante sem gênero | Contado como "Não informado" |
| Visitante sem birth_date | Contado como "Não informado" na faixa etária |
| Superadmin (todos) | Dados de todos os espaços |
| Coordenador | Dados apenas do seu espaço |

---

## 📋 Checklist Final

- [x] Gráfico de Gênero implementado (PieChart)
- [x] Gráfico de Faixa Etária implementado (BarChart)
- [x] Filtros de data integrados
- [x] Filtros de localização integrados
- [x] Tratamento de dados nulos
- [x] Exibição de percentuais
- [x] Responsividade (1 coluna mobile, 2 desktop)
- [x] TypeScript compila
- [x] Build passa

---

**Status:** ✅ IMPLEMENTAÇÃO CONCLUÍDA

Os novos relatórios de Gênero e Faixa Etária foram adicionados à tela de Relatórios, com integração completa aos filtros existentes.