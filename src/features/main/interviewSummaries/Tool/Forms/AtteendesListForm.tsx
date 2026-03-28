import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import TextInput from "../../../../../components/layouts/TextInput";
import DefaultButton from "../../../../../components/layouts/DefaultButton";
import { Form, Formik } from "formik";
import { AttendeeListFormValues } from "../../../../../types/interviewSummaries";
import { interviewSummariesFormAtom } from "../../../../../atoms/interviewDiscusstionGuideAtom";
import { useAtom } from "jotai";
import AtteendesListTable from "./AtteendesListTable";
import { attendeeListSchema } from "../../../../../schemas/interviewSummariesSchema";

export type AttendeesListProps = {
  initialValues: AttendeeListFormValues;
  handleSubmit: (formValues: AttendeeListFormValues) => void;
};

const AttendeesListForm: React.FC<AttendeesListProps> = ({
  initialValues,
  handleSubmit,
}) => {
  const [interviewSummariesFormValues, setInterviewSummariesFormValues] =
    useAtom(interviewSummariesFormAtom);

  const [initialFormValues, setFormInitialValues] = useState(
    interviewSummariesFormValues.attendeeList
  );

  useEffect(() => {
    if (
      initialFormValues?.name ||
      initialFormValues?.position ||
      initialFormValues?.institution ||
      initialFormValues?.list
    ) {
      setFormInitialValues(initialFormValues);
    } else {
      setFormInitialValues(initialValues);
    }
  }, [initialValues, initialFormValues]);

  const handleAddList = (
    values: AttendeeListFormValues,
    resetForm: () => void
  ) => {
    setInterviewSummariesFormValues((prevValues) => ({
      ...prevValues,
      attendeeList: {
        ...prevValues.attendeeList,
        list: [...prevValues?.attendeeList?.list!, values],
      },
    }));
    resetForm();
  };

  return (
    <Formik
      key={JSON.stringify(initialFormValues)}
      initialValues={initialValues}
      validationSchema={attendeeListSchema}
      onSubmit={handleSubmit}
    >
      {({ values, errors, handleChange, resetForm }) => {
        const isAnyFieldEmpty =
          !values.name || !values.position || !values.institution;
        return (
          <Form>
            <Box
              sx={{
                display: "flex",
                width: "100%",
                flexDirection: "column",
                justifyContent: "flex-start",
                gap: 4,
              }}
            >
              <TextInput
                name="name"
                topText="Name"
                inputStyles={{ width: 400 }}
                value={values.name!}
                error={!!errors.name}
                onChange={handleChange}
                type="string"
              />
              <TextInput
                name="position"
                topText="Position"
                inputStyles={{ width: 400 }}
                value={values.position!}
                error={!!errors.position}
                onChange={handleChange}
                type="string"
              />
              <TextInput
                name="institution"
                topText="Institution"
                inputStyles={{ width: 400 }}
                value={values.institution!}
                error={!!errors.institution}
                onChange={handleChange}
                type="string"
              />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                }}
              >
                <DefaultButton
                  style={{
                    width: 100,
                    borderRadius: "15px",
                    height: 45,
                    marginTop: 3,
                    marginBottom: 3,
                  }}
                  type="secondary"
                  submit
                  title="Add"
                  onClick={() => handleAddList(values, resetForm)}
                  disabled={isAnyFieldEmpty}
                />
              </Box>
            </Box>
            <AtteendesListTable
              list={interviewSummariesFormValues?.attendeeList?.list ?? []}
            />
          </Form>
        );
      }}
    </Formik>
  );
};

export default AttendeesListForm;
