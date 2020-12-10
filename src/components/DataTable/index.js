import React from "react";
import isUndefined from "lodash/isUndefined";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import "react-bootstrap-table2-filter/dist/react-bootstrap-table2-filter.min.css";
import "./styles.scss";

import BootstrapTable from "react-bootstrap-table-next";
import filterFactory from "react-bootstrap-table2-filter";
import paginationFactory from "react-bootstrap-table2-paginator";

export default ({ data, columns, keyField, filterListener, listenFilters }) => {
  listenFilters = isUndefined(listenFilters);

  const options = {
    paginationSize: 4,
    pageStartIndex: 1,
    // hideSizePerPage: true, // Hide the sizePerPage dropdown always
    // hidePageListOnlyOnePage: true, // Hide the pagination list when only one page
    firstPageText: "Primera",
    prePageText: "Anterior",
    nextPageText: "Siguiente",
    lastPageText: "Última",
    showTotal: true,
    paginationTotalRenderer: (from, to, size) => (
      <span className="react-bootstrap-table-pagination-total">
        &nbsp;Mostrando {from} a {to} de {size} resultados
      </span>
    ),
    sizePerPageList: [
      { text: 5, value: 5 },
      { text: 10, value: 10 },
      { text: 15, value: 15 },
      { text: 20, value: 20 },
      { text: "All", value: data.length },
    ],
  };

  return (
    <div className="table-container">
      <div className="table-child">
        <BootstrapTable
          bootstrap4
          striped
          filter={filterFactory()}
          pagination={paginationFactory(options)}
          keyField={keyField}
          data={data}
          columns={columns}
          /*remote={{
            filter: listenFilters
          }}
          onTableChange={filterListener}*/
          noDataIndication="There is no data to show"
        />
      </div>
    </div>
  );
};
