<script setup lang="ts">
interface Column {
  key: string
  label: string
}

const { columns, rows } = defineProps<{
  columns: Column[]
  rows: Record<string, string | number>[]
}>()
</script>

<template>
  <div class="jr-table-wrap">
    <table class="jr-table">
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.key">
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in rows" :key="i">
          <td v-for="col in columns" :key="col.key">
            {{ row[col.key] }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.jr-table-wrap {
  overflow-x: auto;
  border: 1px solid var(--jr-border, #e4e4e7);
  border-radius: var(--jr-radius-lg, 0.75rem);
}
.jr-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}
.jr-table th,
.jr-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--jr-border, #e4e4e7);
  line-height: 1.5;
}
.jr-table th {
  background: var(--jr-muted, #f4f4f5);
  font-weight: 500;
  font-size: 0.8125rem;
  color: var(--jr-muted-text, #71717a);
  white-space: nowrap;
}
.jr-table tbody tr:last-child td {
  border-bottom: none;
}
.jr-table tbody tr:hover {
  background: var(--jr-muted, #f4f4f5);
}
</style>
