import {useState} from "react";
import {InvoiceMapping} from "../../pages/invoice-configuration-page/InvoiceConfigPage.tsx";
interface DefaultMappingTableProps {
  headers: string[]; // Table headers
  QBProducts: any[]; // Data to map (e.g., membership levels)
  onMappingChange : (fields: InvoiceMapping) => void; // Callback for selection,
  classesList ?: any[];
  defaultData: InvoiceMapping
}

export const DefaultMappingTable = ({headers, QBProducts, classesList, onMappingChange, defaultData}: DefaultMappingTableProps) => {

  const handleProductSelection = (event) => {
    const selectedOption = event.target.options[event.target.selectedIndex];
    const id = selectedOption.value; // option's value
    const name = selectedOption.text;  // option's name (text inside <option>)

    const IncomeAccount = QBProducts.find(option => option.Id == id)?.IncomeAccountRef?.name

    onMappingChange({QBProductId: id, QBProduct: name, IncomeAccount})
  }

  const handleClassSelection = (event) => {
    const selectedOption = event.target.options[event.target.selectedIndex];
    const id = selectedOption.value; // option's value
    const name = selectedOption.text;  // option's name (text inside <option>)

    onMappingChange({classId: id, class: name})
  }

  return (
    <div className={'table-container table-wrapper mb-2'}>
      <table className="table ">
        <colgroup>
          <col style={{ width: `${100/headers.length}%` }} />
        </colgroup>
        <thead className={'table-light'}>
        <tr>
          {
            headers.map((header, index) => {
              return <th key={index} className={'fw-medium'} scope="col">{header}</th>
            })
          }
        </tr>
        </thead>
        <tbody>
          <tr>
            <td className="d-flex border-bottom-0 align-items-center gap-2"> <select
              className="form-select"
              value={defaultData.QBProductId}
              onChange={(event) => handleProductSelection(event)}
            >
              <option value="">
                Choose {headers[0]}
              </option>
              {QBProducts.map((option) => (
                <option key={option.Id} value={option.Id}>
                  {option.Name}
                </option>
              ))}
            </select>
            </td>
            <td><input value={defaultData.IncomeAccount || ""} disabled className={'form-control'}/></td>
            {classesList &&
                <td>
                    <select
                        className="form-select"
                        value={defaultData.classId || ""}
                        onChange={handleClassSelection}
                    >
                        <option value="" disabled>
                            Choose {headers[2]}
                        </option>
                      {classesList.map((option) => (
                        <option key={option.Id} value={option.Id}>
                          {option.Name}
                        </option>
                      ))}
                    </select>
                </td>
            }
          </tr>
        </tbody>
      </table>
    </div>
  );
};
