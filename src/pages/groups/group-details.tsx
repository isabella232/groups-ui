import React, { useEffect, useState } from 'react'
import {
    Box,
    Button,
    IconButton,
    makeStyles,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableRow, TableSortLabel, TextField,
    useTheme,
    withStyles
} from '@material-ui/core'
import { ArrowBack, KeyboardArrowLeft, KeyboardArrowRight } from '@material-ui/icons'
import { observer } from 'mobx-react-lite'
import { useStyles } from './admin-view'
import PropTypes from 'prop-types'
import { Link, useHistory, useParams } from 'react-router-dom'
import { Page } from '../page'
import { useStores } from '../../shared-state/repo'
import { Routes } from '../../routes'
import Pagination from '@material-ui/lab/Pagination'

const useStyles1 = makeStyles((theme) => ({
    root: {
        flexShrink: 0,
        marginLeft: theme.spacing(2.5)
    }
}))

function TablePaginationActions(props) {
    const classes = useStyles1()
    const theme = useTheme()
    const { count, page, rowsPerPage, onPageChange } = props

    const handleBackButtonClick = (event) => {
        onPageChange(event, page - 1)
    }

    const handleNextButtonClick = (event) => {
        onPageChange(event, page + 1)
    }

    return (
        <div className={classes.root}>
            <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page">
                {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
            </IconButton>
            <IconButton
                onClick={handleNextButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="next page"
            >
                {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
            </IconButton>
        </div>
    )
}

TablePaginationActions.propTypes = {
    count: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

type Order = 'asc' | 'desc';

interface Data {
    address: string;
    weight: string;
    date: string;
};

function createData(
    address: string,
    weight: string,
    date: string,
): Data {
    return {
        address,
        weight,
        date,
    };
}

function getComparator<Key extends keyof any>(
    order: Order,
    orderBy: Key,
): (
        a: { [key in Key]: number | string },
        b: { [key in Key]: number | string },
    ) => number {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
    const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) {
            return order;
        }
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}

interface HeadCell {
    disablePadding: boolean;
    id: keyof Data;
    label: string;
    numeric: boolean;
}

const headCells: readonly HeadCell[] = [
    {
        id: 'address',
        numeric: false,
        disablePadding: true,
        label: 'address',
    },
    {
        id: 'weight',
        numeric: true,
        disablePadding: false,
        label: 'voting weight',
    },
    {
        id: 'date',
        numeric: true,
        disablePadding: false,
        label: 'date added',
    },
];

interface EnhancedTableProps {
    numSelected: number;
    onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Data) => void;
    order: Order;
    orderBy: string;
    rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
    const { order, orderBy, numSelected, rowCount, onRequestSort } =
        props;
    const createSortHandler =
        (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
            onRequestSort(event, property);
        };

    return (
        <TableHead>
            <TableRow>
                {headCells.map((headCell) => (
                    <StyledTableCell
                        style={{ paddingLeft: '40px' }}
                        key={headCell.id}
                        sortDirection={orderBy === headCell.id ? order : false}
                    >
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : 'asc'}
                            onClick={createSortHandler(headCell.id)}
                        >
                            {headCell.label}
                            {orderBy === headCell.id ? (
                                <Box component="span">

                                </Box>
                            ) : null}
                        </TableSortLabel>
                    </StyledTableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

const StyledTableCell = withStyles(() => ({
    head: {
        padding: '23px 40px',
        fontSize: '12px',
        fontWeight: 800,
        textTransform: 'uppercase',
        fontFamily: ' \'Mulish\', sans-serif '
    },
    body: {
        padding: '48px 40px',
        fontSize: '16px'
    }
}))(TableCell)

const StyledTableRow = withStyles((theme) => ({
    root: {
        textAlign: 'left',
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.action.hover
        }
    }
}))(TableRow)

const tableStyles = makeStyles({
    table: {
        borderTop: '1px solid #EFEFEF',
        minWidth: 700
    }
})


export const GroupDetails: React.FC<{}> = observer(() => {
    const { editedGroup, resetEditedGroup, fetchEditedGroupById } = useStores().groupsStore
    const [membersEditMode, setMembersEditMode] = useState(false)
    const [newMember, setNewMember] = useState('')

    const history = useHistory()

    const classes = useStyles()
    const table = tableStyles()

    const pathParams: any = useParams()
    const groupId = pathParams.id === 'new' ? -1 : Number(pathParams.id)

    const [order, setOrder] = React.useState<Order>('asc');
    const [orderBy, setOrderBy] = React.useState<keyof Data>('address');
    const [selected, setSelected] = React.useState<readonly string[]>([]);
    const [page, setPage] = React.useState(0);
    const [dense, setDense] = React.useState(false);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

    const handleRequestSort = (
        event: React.MouseEvent<unknown>,
        property: keyof Data,
    ) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelecteds = editedGroup.members.map((n) => n.member.address);
            setSelected(newSelecteds);
            return;
        }
        setSelected([]);
    };

    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - editedGroup.members.length) : 0;

    useEffect(() => {
        if (!editedGroup) {
            if (groupId === -1) {
                history.push('/groups/new')
            } else {
                (async () => {
                    const group = await fetchEditedGroupById(groupId)
                    if (!group) {
                        history.push(Routes.GROUPS)
                    }
                })()
            }
        }

        return () => {
            resetEditedGroup()
        }
    }, [resetEditedGroup])

    if (!editedGroup) {
        return (
            <Page>
                <div>loading ...</div>
            </Page>
        )
    }


    return (
        <Page>
            <div className={classes.root}>
                <div>
                    <Link to="#" style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 800 }}
                        className={classes.link} onClick={() => console.log('click')}>
                        <ArrowBack style={{ fontSize: '18px', marginRight: '8px' }} />
                        Foo dev team
                    </Link>
                    <div className={classes.heroBlock}>
                        <h1>Group Details</h1>
                        <Link to={`/groups/${groupId}`}>
                            <Button variant="contained" color="primary" className="btn">
                                edit group
                            </Button>
                        </Link>
                    </div>
                    <div className={classes.heroBlock}>
                        <p className="subtitle">This group is to manage the funds for the Foo developer team’s
                            efforts.</p>
                    </div>
                    <div className={classes.regen}>
                        <p style={{ marginLeft: '0' }}>group admin</p>
                        <p>
                            {editedGroup.info.admin}
                        </p>
                    </div>
                    <br />
                </div>
                <Paper elevation={2}>
                    <h2 style={{ padding: '40px', fontWeight: 900 }}>Group Policy</h2>
                    <Table className={table.table} aria-label="customized table">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell>Date</StyledTableCell>
                                <StyledTableCell align="left">voting window</StyledTableCell>
                                <StyledTableCell align="left">threshold</StyledTableCell>
                                <StyledTableCell align="left">quorum</StyledTableCell>
                                <StyledTableCell align="left">admin</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(editedGroup.policy || []).map((p, i) => (
                                <StyledTableRow key={i}>
                                    <StyledTableCell align="left">{'TODO Date'}</StyledTableCell>
                                    <StyledTableCell align="left">{`${p.timeoutInDays} days`}</StyledTableCell>
                                    <StyledTableCell align="left">{p.threshold}</StyledTableCell>
                                    <StyledTableCell align="left">{'TODO no data for quorum'}</StyledTableCell>
                                    <StyledTableCell align="left">{editedGroup.info.admin}</StyledTableCell>
                                </StyledTableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>
                <Paper elevation={2} style={{ marginTop: '21px' }}>
                    <div className={classes.heroBlock}>
                        <h2 style={{ padding: '40px', fontWeight: 900 }}>Members</h2>
                        {membersEditMode ? (
                            <div style={{
                                display: 'flex'
                            }}>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    value={newMember}
                                    onChange={e => setNewMember(e.target.value)}
                                />
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    className="tableBtn"
                                    onClick={console.log}
                                >
                                    Add member
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    className="tableBtn"
                                    onClick={console.log}
                                >
                                    Cancel Changes
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    className="tableBtn"
                                    onClick={console.log}
                                >
                                    Save Changes
                                </Button>
                            </div>
                        ) : (
                            <Button
                                variant="outlined"
                                color="primary"
                                className="tableBtn"
                                onClick={() => setMembersEditMode(true)}
                            >
                                Edit members
                            </Button>
                        )}
                    </div>
                    <Table className={table.table} aria-label="custom pagination table">
                        {/* <TableHead>
                            <TableRow>
                                <StyledTableCell>Address</StyledTableCell>
                                <StyledTableCell align="left">voting weight</StyledTableCell>
                                <StyledTableCell align="left">date added</StyledTableCell>
                            </TableRow>
                        </TableHead> */}
                        <EnhancedTableHead
                            numSelected={selected.length}
                            order={order}
                            orderBy={orderBy}
                            onRequestSort={handleRequestSort}
                            rowCount={editedGroup.members.length}
                        />
                        <TableBody>
                            {editedGroup.members.map((m, i) => {
                                return (
                                    <StyledTableRow key={m.member.address}>
                                        <StyledTableCell align="left" style={{
                                            width: '15%',
                                            padding: '28px 40px'
                                        }}>{m.member.address}</StyledTableCell>
                                        <StyledTableCell align="left" style={{
                                            width: '15%',
                                            padding: '28px 40px'
                                        }}>{m.member.weight}</StyledTableCell>
                                        <StyledTableCell align="left" style={{
                                            width: '30%',
                                            padding: '28px 40px'
                                        }}>{'TODO Date added'}</StyledTableCell>
                                    </StyledTableRow>
                                )
                            })}
                        </TableBody>
                        <TableFooter style={{ height: '90px' }}>
                            <TableRow >
                                <Pagination count={10} color="primary" style={{ width: '220%', marginTop: '25px', display: 'flex', justifyContent: 'flex-end' }} />
                            </TableRow>
                        </TableFooter>
                    </Table>
                </Paper>
            </div>
        </Page>
    )
})
