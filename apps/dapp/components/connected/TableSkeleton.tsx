import { Skeleton } from '../shared/Skeleton'; // Assurez-vous d'avoir un composant Skeleton

export interface ITableSkeleton {
  totalCol: number;
  totalRows: number;
}

export const TableSkeleton: React.FC<ITableSkeleton> = ({
  totalCol,
  totalRows,
}) => {
  // Crée un tableau de `totalRows` éléments pour mapper les lignes
  const rows = Array.from({ length: totalRows }, (_, rowIndex) => (
    <div
      key={`row-${rowIndex}`}
      className="c-tableSkeleton__row flex w-full border-b border-blue-003"
    >
      {/* Pour chaque ligne, crée un tableau de `totalCol` éléments pour mapper les cellules */}
      {Array.from({ length: totalCol }, (_, colIndex) => (
        <div
          key={`col-${rowIndex}-${colIndex}`}
          className="c-tableSkeleton__cell flex-1 py-3 px-2"
        >
          {/* Utiliser un composant Skeleton pour un meilleur effet visuel */}
          <Skeleton variant="text" width="80%" />
        </div>
      ))}
    </div>
  ));

  return <div className="animate-pulse">{rows}</div>;
};

TableSkeleton.displayName = 'TableSkeleton';
