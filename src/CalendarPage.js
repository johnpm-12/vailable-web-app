import React, { useState, useRef } from "react";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import TextField from "@material-ui/core/TextField";
import Snackbar from "@material-ui/core/Snackbar";
import EventAvailableTwoToneIcon from "@material-ui/icons/EventAvailableTwoTone";
import ShareTwoToneIcon from "@material-ui/icons/ShareTwoTone";
import { ViewState, EditingState } from "@devexpress/dx-react-scheduler";
import {
  Scheduler,
  MonthView,
  Appointments,
  Toolbar,
  DateNavigator,
  AppointmentTooltip,
  AppointmentForm,
  ViewSwitcher,
  TodayButton,
  DayView,
  WeekView,
  EditRecurrenceMenu,
  CurrentTimeIndicator,
  DragDropProvider,
} from "@devexpress/dx-react-scheduler-material-ui";
import { useLocation, useHistory } from "react-router-dom";

// TODO:
// set name and remember for future adds? with a cookie or local storage?
// auto display widest range by default?

function TitleDialog({ name, open, close, setName }) {
  const titleText = useRef();

  return (
    <Dialog open={open} onClose={close}>
      <DialogTitle>Calendar Name</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          type="text"
          inputRef={titleText}
          defaultValue={name}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>Cancel</Button>
        <Button
          onClick={() => {
            setName(titleText.current.value);
            close();
          }}
        >
          Okay
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function CopiedSnackBar({ message, open, close }) {
  return (
    <Snackbar
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      open={open}
      autoHideDuration={3000}
      onClose={close}
      message={message}
    />
  );
}

const defaultCopiedMessage =
  "Link copied! Paste it in a message or email to share";

function Calendar({ data, setData }) {
  return (
    <Scheduler data={data.a}>
      <EditingState
        onCommitChanges={({ added, changed, deleted }) => {
          if (added) {
            const startingAddedId =
              data.a.length > 0 ? data.a[data.a.length - 1].id + 1 : 0;
            data.a = [...data.a, { id: startingAddedId, ...added }];
          }
          if (changed) {
            data.a = data.a.map((appointment) =>
              changed[appointment.id]
                ? { ...appointment, ...changed[appointment.id] }
                : appointment
            );
          }
          if (deleted !== undefined) {
            data.a = data.a.filter((appointment) => appointment.id !== deleted);
          }
          setData(data);
        }}
      />
      <ViewState />
      <MonthView />
      <WeekView startDayHour={7.5} endDayHour={22.5} />
      <DayView startDayHour={7.5} endDayHour={22.5} />
      <Toolbar />
      <DateNavigator />
      <TodayButton />
      <ViewSwitcher />
      <Appointments />
      <EditRecurrenceMenu />
      <DragDropProvider />
      <CurrentTimeIndicator shadePreviousAppointments shadePreviousCells />
      <AppointmentTooltip showOpenButton showDeleteButton showCloseButton />
      <AppointmentForm
        onVisibilityChange={(visible) => {
          if (visible) {
            window.scroll({ top: 0, left: 0, behavior: "auto" });
          }
        }}
      />
    </Scheduler>
  );
}

function CalendarPage({ data, setData }) {
  const [titleDialogOpen, setTitleDialogOpen] = useState(false);
  const [copiedSnackbarOpen, setCopiedSnackbarOpen] = useState(false);
  const [copiedSnackbarMessage, setCopiedSnackbarMessage] = useState(
    defaultCopiedMessage
  );
  const location = useLocation();
  const history = useHistory();

  return (
    <Container disableGutters>
      <TitleDialog
        name={data.n}
        open={titleDialogOpen}
        close={() => setTitleDialogOpen(false)}
        setName={(name) => {
          data.n = name;
          setData(data);
        }}
      />
      <CopiedSnackBar
        message={copiedSnackbarMessage}
        open={copiedSnackbarOpen}
        close={() => setCopiedSnackbarOpen(false)}
      />
      <Paper>
        <Grid container>
          <Grid
            item
            xs={12}
            container
            direction="row"
            justify="space-between"
            alignItems="center"
            style={{
              paddingTop: "0.5rem",
              paddingLeft: "0.5rem",
              paddingRight: "0.5rem",
            }}
            spacing={2}
          >
            <Grid
              item
              xs={12}
              container
              direction="row"
              justify="flex-start"
              alignItems="center"
              spacing={1}
              // wrap="nowrap"
            >
              <Grid item>
                <EventAvailableTwoToneIcon fontSize="large" />
              </Grid>
              <Grid item>
                <Typography variant="h5" noWrap>
                  Vailable
                </Typography>
              </Grid>
              <Grid item>
                <Typography variant="caption" noWrap>
                  Easy Calendar Sharing
                </Typography>
              </Grid>
            </Grid>
            <Grid
              item
              xs={12}
              container
              direction="row"
              justify="center"
              alignItems="center"
              spacing={1}
              // wrap="nowrap"
            >
              <Grid item>
                <Button
                  size="large"
                  variant="outlined"
                  onClick={() => setTitleDialogOpen(true)}
                >
                  {data.n || "Unnamed Calendar"}
                </Button>
              </Grid>
              <Grid item>
                <Typography variant="caption" noWrap>
                  last edited {data?.l || "never"}
                </Typography>
              </Grid>
            </Grid>
            <Grid
              item
              xs={12}
              container
              direction="row"
              justify="flex-end"
              alignItems="center"
              spacing={1}
              // wrap="nowrap"
            >
              <Grid item>
                <Button
                  size="medium"
                  variant="outlined"
                  onClick={() => setData({ a: [] })}
                >
                  New Calendar
                </Button>
              </Grid>
              <Grid item>
                <Button
                  size="medium"
                  variant="outlined"
                  endIcon={<ShareTwoToneIcon />}
                  onClick={async () => {
                    let url = `https://vailable.github.io${location.pathname}${location.search}`;
                    try {
                      const resp = await fetch(
                        `https://tinyurl.com/api-create.php?url=${encodeURIComponent(
                          url
                        )}`
                      );
                      const newUrl = await resp.text();
                      if (newUrl.startsWith("https://tinyurl.com/")) {
                        url = newUrl;
                      }
                    } catch (e) {
                      // console.error(e);
                    }
                    try {
                      if (window.navigator.share) {
                        window.navigator.share({
                          // title: data.n || "Vailable",
                          text: `${
                            data.n ? `${data.n} - ` : ""
                          }Vailable - Easy Calendar Sharing App`,
                          url,
                        });
                        return;
                      }
                    } catch (e) {
                      // console.error(e);
                      // setCopiedSnackbarMessage(`Error: ${e}`);
                      // setCopiedSnackbarOpen(true);
                    }
                    if (window.navigator.clipboard) {
                      window.navigator.clipboard
                        .writeText(url)
                        .then(() => {
                          setCopiedSnackbarMessage(defaultCopiedMessage);
                          setCopiedSnackbarOpen(true);
                        })
                        .catch((e) => {
                          // TODO: pop up a modal with the link and directions to copy and send to someone to share
                          setCopiedSnackbarMessage(
                            "Error sharing automatically. Copy the URL of the current page to share your calendar"
                          );
                          setCopiedSnackbarOpen(true);
                        });
                      return;
                    }
                    setCopiedSnackbarMessage(
                      "Error sharing automatically. Copy the URL of the current page to share your calendar"
                    );
                    setCopiedSnackbarOpen(true);
                  }}
                >
                  Share Changes
                </Button>
              </Grid>
              <Grid item>
                <Button
                  size="medium"
                  variant="outlined"
                  onClick={() => history.goBack()}
                >
                  Undo
                </Button>
              </Grid>
              <Grid item>
                <Button
                  size="medium"
                  variant="outlined"
                  onClick={() => history.goForward()}
                >
                  Redo
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Calendar data={data} setData={setData} />
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default CalendarPage;
