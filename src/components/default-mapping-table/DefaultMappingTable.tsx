import {useState} from "react";
import {InvoiceMapping} from "../../pages/invoice-configuration-page/InvoiceConfigPage.tsx";
export interface DefaultMappingTableProps<T extends InvoiceMapping> {
  headers: string[]; // Table headers
  QBProducts: any[]; // Data to map (e.g., membership levels)
  onMappingChange : (fields: T) => void; // Callback for selection,
  classesList ?: any[];
  defaultData: T,
  isContentLoading: boolean
}

export const DefaultMappingTable = <T extends InvoiceMapping> ({headers, QBProducts, classesList, onMappingChange, defaultData, children, isContentLoading}: DefaultMappingTableProps<T>) => {

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
          <>
            {headers.map((_, index) => (
              <col key={index} style={{ width: `${100 / (headers.length)}%` }} />
            ))}
          </>
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
            {children}
            <td className={"placeholder-glow"}>
              {!isContentLoading ?
                <select
                className="form-select"
                value={defaultData.QBProductId}
                onChange={(event) => handleProductSelection(event)}
                >
                  <option value="">
                    Choose QB Product
                  </option>
                  {QBProducts.map((option) => (
                    <option key={option.Id} value={option.Id}>
                      {option.Name}
                    </option>
                  ))}
                </select> :
                <span className="placeholder rounded-2 p-3 col-12"></span>
              }</td>
            <td className={"placeholder-glow"}>
              {isContentLoading ? <span className="placeholder rounded-2 p-3 col-12"></span> : <input value={defaultData.IncomeAccount || ""} disabled className={'form-control'}/>}
            </td>
            {classesList &&
                <td className={"placeholder-glow"}>
                  {!isContentLoading ?
                    <select
                    className="form-select"
                    value={defaultData.classId || ""}
                    onChange={handleClassSelection}
                    >
                      <option value="" disabled>
                        Choose Class
                      </option>
                      {classesList.map((option) => (
                        <option key={option.Id} value={option.Id}>
                          {option.Name}
                        </option>
                      ))}
                    </select> :
                    <span className="placeholder rounded-2 p-3 col-12"></span>
                  }
                </td>
            }
          </tr>
        </tbody>
      </table>
    </div>
  );
};
