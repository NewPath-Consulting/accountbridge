import {TableColumn} from "./tableColumns.ts";
import './AlternateMappingTable.css'

export interface IAlternateMappingTableProps {
  columns: TableColumn[],
  data: any,
  mappingData: any[],
  onMappingChange: (actionType: string, actionPayload: {}) => void;
  isContentLoading: boolean;
}

const AlternateMappingTable = ({
                                columns,
                                data,
                                mappingData,
                                onMappingChange,
                                isContentLoading
                              }: IAlternateMappingTableProps) => {
  const handleFieldChange = (index, columnId, options, event) => {
    const selectedOption = event.target.options[event.target.selectedIndex];
    const value = selectedOption.value;
    const name = selectedOption.text;

    // Handle special case for QB field
    if (columnId === 'qb') {
      const incomeAccount = data[options].find(
        option => option.Id === value
      )?.IncomeAccountRef?.name;

      onMappingChange(`CHANGE_${columnId.toUpperCase()}_FIELD`, {
        index,
        value,
        name,
        incomeAccount
      });
    } else {
      onMappingChange(`CHANGE_${columnId.toUpperCase()}_FIELD`, {
        index,
        value,
        name
      });
    }
  };

  const renderCell = (column, rowData, rowIndex) => {
    switch (column.type) {
      case 'select':
        return (
          <select
            className="form-select"
            value={rowData[column.key] || ""}
            onChange={(e) => handleFieldChange(rowIndex, column.id, column.options, e)}
            disabled={column.disabled}
          >
            <option value="">Choose {column.header}</option>
            {data[column.options].map((option) => (
              <option
                key={option.Id || option || ""}
                value={option.Id || option || ""}
                disabled={column.disableUsed && mappingData.some(
                  data => data[column.key] === (option.Id || option || "")
                )}
              >
                {option.Name || option || ""}
              </option>
            ))}
          </select>
        );

      case 'input':
        return (
          <input
            className="form-control"
            value={rowData[column.key] || ""}
            disabled={column.disabled}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="table-container table-wrapper">
      <table className="table">
        <colgroup>
          <>
            {columns.map((_, index) => (
              <col key={index} style={{ width: `${100 / (columns.length)}%` }} />
            ))}
          </>
        </colgroup>

        <caption>
          <button
            className="table-button d-inline"
            onClick={() => onMappingChange("ADD_ROW", {})}
          >
            <i className="bi bi-plus"></i>Add Mapping Row
          </button>
        </caption>

        <thead className="table-light">
        <tr>
          {columns.map((column, index) => (
            <th key={index} className="fw-medium" scope="col">
              {column.header}
            </th>
          ))}
          <th></th>
        </tr>
        </thead>

        <tbody>
        {mappingData.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {columns.map((column, colIndex) => (
              <td key={colIndex}>
                <div className="select-container placeholder-glow">
                  {isContentLoading ? <span className="placeholder rounded-2 p-3 col-12"></span> : renderCell(column, row, rowIndex)}

                </div>
              </td>
            ))}
            <td>
              <button
                className="table-button"
                onClick={() => {
                  console.log({index: rowIndex})
                  return onMappingChange("DELETE_ROW", {index: rowIndex})
                }}
              >
                <i className="bi bi-trash"></i>
              </button>
            </td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
};

export default AlternateMappingTable;