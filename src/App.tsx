import React, { useEffect, useState } from "react";
import data from "./assets/salaries.json";
import { useTable, useSortBy, Column } from "react-table";
//import { Line } from "react-chartjs-2";
import './App.css'; 
import Chat from "./chat";

interface JobData {
  work_year: number;
  job_title: string;
  salary_in_usd: number;
}

interface JobStats {
  year: number;
  totalJobs: number;
  totalSalaries: number;
  averageSalary: number;
}

interface AggregatedJobStats {
  job_title: string;
  count: number;
}

const JobCount: React.FC = () => {
  const [jobStatsByYear, setJobStatsByYear] = useState<JobStats[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [aggregatedJobs, setAggregatedJobs] = useState<AggregatedJobStats[]>([])

  useEffect(() => {
    const calculateJobStatsByYear = () => {
      const statsByYear: { [key: number]: JobStats } = {};

      Object.entries(data).forEach(([, entry]) => {
        const { work_year, salary_in_usd } = entry as JobData;

        if (!statsByYear[work_year]) {
          statsByYear[work_year] = {
            year: work_year,
            totalJobs: 0,
            totalSalaries: 0,
            averageSalary: 0,
          };
        }

        statsByYear[work_year].totalJobs++;
        statsByYear[work_year].totalSalaries += salary_in_usd;
      });

      for (const year in statsByYear) {
        statsByYear[year].averageSalary =
          statsByYear[year].totalSalaries / statsByYear[year].totalJobs;
      }

      const statArray: JobStats[] = Object.values(statsByYear);
      setJobStatsByYear(statArray);
    };
    calculateJobStatsByYear();
  }, []);

  //Agreagated Job Stats Calculations
  useEffect(() => {
    if(selectedYear != null){
      const aggregatedJobsByYear: {[key: string]: number } = {};

      Object.entries(data).forEach(([, entry]) => {
        const {work_year, job_title} = entry as JobData;
        if(work_year === selectedYear){
          if(!aggregatedJobsByYear[job_title]){
            aggregatedJobsByYear[job_title] = 0;
          }
          aggregatedJobsByYear[job_title]++;  
        }
      })

      const aggreagatedArray: AggregatedJobStats[] = Object.keys(aggregatedJobsByYear).map(jobTitle => ({
        job_title: jobTitle,
        count: aggregatedJobsByYear[jobTitle],
      }))

      setAggregatedJobs(aggreagatedArray)
    }
  }, [selectedYear])

  //Chart
  // const chartData = {
  //   labels: jobStatsByYear.map((stat) => stat.year.toString()),
  //   datasets: [
  //     {
  //       label: "Number of Jobs",
  //       backgroundColor: "rgba(75, 192, 192, 0.2)",
  //       borderColor: "rgba(75, 192, 192, 1)",
  //       borderWidth: 1,
  //       hoverBackgroundColor: "rgba(75, 192, 192, 0.4)",
  //       hoverBorderColor: "rgba(75, 192, 192, 1)",
  //       data: jobStatsByYear.map((stat) => stat.totalJobs),
  //       fill: false,
  //     },
  //   ],
  // };

  const columns: Column<JobStats>[] = React.useMemo(
    () => [
      {
        Header: 'Year',
        accessor: 'year',
      },
      {
        Header: 'Number of Total Jobs',
        accessor: 'totalJobs',
      },
      {
        Header: 'Average Salary in USD',
        accessor: 'averageSalary',
        Cell: ({ value }) => value.toFixed(2),
      },
    ],
    []
  );
  
  const aggregatedColumns: Column<AggregatedJobStats>[] = React.useMemo(
    () => [
      {
        Header: 'JobTitles',
        accessor: 'job_title',
      },
      {
        Header: 'Count',
        accessor: 'count',
      }
    ],
    []
  );

  const {
     getTableProps: getAggTableProps,
     getTableBodyProps: getAggTableBodyProps, 
     headerGroups: aggHeaderGroups, 
     rows: aggRows, 
     prepareRow: prepareAggRow 

  } = useTable({columns: aggregatedColumns, data: aggregatedJobs}, useSortBy);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data: jobStatsByYear }, useSortBy);
  
  return (
    <div className="container">

      {/* <div className="chart-container" style={{ marginBottom: "20px" }}>
        <Line data={chartData} />
      </div> */}

      <table {...getTableProps()}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render('Header')}
                  <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? ' 🔽'
                        : ' 🔼'
                      : ''}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} onClick={() => setSelectedYear(row.original.year)}>
                {row.cells.map(cell => (
                  <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      {selectedYear && (
        <div>
          <h2>Aggregated Job Titles for {selectedYear}</h2>
          <table {...getAggTableProps()}>
            <thead>
              {aggHeaderGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map(column => (
                    <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                      {column.render('Header')}
                      <span>
                        {column.isSorted
                          ? column.isSortedDesc
                            ? ' 🔽'
                            : ' 🔼'
                          : ''}
                      </span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getAggTableBodyProps()}>
              {aggRows.map(row => {
                prepareAggRow(row);
                return (
                  <tr {...row.getRowProps()}>
                    {row.cells.map(cell => (
                      <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <Chat />
    </div>
  );
}

export default JobCount;
