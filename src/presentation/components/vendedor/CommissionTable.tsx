"use client";

import { useCommissions } from "@/presentation/hooks/useCommissions";

const STATUS_CONFIG = {
  pending: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800" },
  approved: { label: "Aprobado", className: "bg-green-100 text-green-800" },
  paid: { label: "Pagado", className: "bg-blue-100 text-blue-800" },
} as const;

function formatPEN(amount: number): string {
  return `S/ ${amount.toLocaleString("es-PE")}`;
}

interface CommissionTableProps {
  vendedorId: string;
}

export function CommissionTable({ vendedorId }: CommissionTableProps) {
  const { data: commissions, isLoading } = useCommissions(vendedorId);

  if (isLoading) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Cargando comisiones...
      </div>
    );
  }

  if (!commissions || commissions.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Sin comisiones registradas
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Venta
            </th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
              Precio
            </th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
              Comisión
            </th>
            <th className="px-4 py-3 text-center font-medium text-muted-foreground">
              Estado
            </th>
          </tr>
        </thead>
        <tbody>
          {commissions.map((commission) => {
            const statusConfig =
              STATUS_CONFIG[commission.status as keyof typeof STATUS_CONFIG];
            return (
              <tr
                key={commission.id}
                className="border-b border-border last:border-0"
              >
                <td className="px-4 py-3 text-foreground">
                  {commission.propertyId.slice(0, 8)}
                </td>
                <td className="px-4 py-3 text-right text-foreground">
                  {formatPEN(commission.salePrice)}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-foreground">
                  {formatPEN(commission.commissionAmount)}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig.className}`}
                  >
                    {statusConfig.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
