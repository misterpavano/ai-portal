import Box from "@mui/material/Box";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { AttendeeListFormValues } from "../../../../../types/interviewSummaries";

export type AttendeesListTableProps = {
  list: AttendeeListFormValues[];
};

const AttendeesListTable: React.FC<AttendeesListTableProps> = ({ list }) => {
  return (
    <Box sx={{ width: "100%", marginBottom: 5 }}>
      <Table>
        <TableHead>
          <TableRow
            sx={{
              backgroundColor: "#F5F5F4",
              borderRadius: "10px",
              height: "36px",
            }}
          >
            <TableCell
              sx={{ fontWeight: "bold", textAlign: "left", width: "60px" }}
            >
              Name
            </TableCell>
            <TableCell align="left" sx={{ fontWeight: "bold", width: "90px" }}>
              Position
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", textAlign: "left" }}>
              Institution
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {list.map((section, index) => (
            <TableRow
              key={index}
              sx={{
                borderRadius: "10px",
                overflow: "hidden",
                backgroundColor: "#fff",
                border: "1px solid #D0D5DD",
                marginBottom: "10px",
              }}
            >
              <TableCell>{section.name}</TableCell>
              <TableCell
                sx={{
                  textAlign: "center",
                  width: "90px",
                }}
              >
                {section.position}
              </TableCell>
              <TableCell>{section.institution}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default AttendeesListTable;
