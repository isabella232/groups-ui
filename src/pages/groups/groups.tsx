import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useStores } from '../../shared-state/repo'
import { Button, makeStyles, Paper, Table, TableBody, TableCell, TableHead, TableRow, withStyles } from '@material-ui/core'
import { Routes } from '../../routes'
import { Link } from 'react-router-dom'

const useStyles = makeStyles((theme) => ({
    tableHead: {

        '& th': {
            // padding: '0',
            // border: 'none',
            // fontWeight: 800,
            // textAlign: 'left',
            // fontFamily: " 'Mulish' ",
            // fontSize: '12px',
        }
    },

    tableRow: {
        // display: 'flex',
        // justifyContent: 'space-between',
        // padding: '20px 40px',
        // alignItems: "center"
    },

    headCell: {
        fontWeight: 700,
    },

    nameCol: {
        fontWeight: 900,
        fontSize: '18px'
        // width: '30%',
    },

    col: {
        fontSize: '16px',
        fontFamily: " 'Lato', sans-serif ",
        padding: '48px 16px',
        // width: '20%'
    },

    tableItem: {
        // padding: '48px 40px',
        // transition: 'background-color .4s',
        //
        // '&:hover': {
        //     backgroundColor: '#FAFAFA',
        //     transition: 'background-color .4s'
        // }
    }
}))

const StyledTableRow = withStyles((theme) => ({
    root: {
        textAlign: 'left',
        '&:nth-of-type(odd)': {
            backgroundColor: '#FAFAFA',
        },
    },
}))(TableRow)

export const Groups: React.FC<{}> = observer(() => {
    const { groups, fetchGroups } = useStores().groupsStore
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        fetchGroups()
            .then(() => setLoading(false))
    }, [fetchGroups])

    const tableStyle = useStyles()

    return (
        <div style={{ width: '1140px' }}>
            <div style={{
                marginTop: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <div style={{
                    fontWeight: 900,
                    fontSize: '38px',
                }}>
                    Groups
                </div>
                <Link to="/groups/new">
                    <Button
                        variant="contained"
                        color="primary"
                    >
                        {'Create group'}
                    </Button>
                </Link>
            </div>

            <Paper style={{
                marginTop: '48px',
            }}>
                <Table>
                    <TableHead className={tableStyle.tableHead}>
                        <TableRow className={tableStyle.tableRow}>
                            <TableCell className={tableStyle.headCell}>Name</TableCell>
                            <TableCell className={tableStyle.headCell}>Created</TableCell>
                            <TableCell className={tableStyle.headCell}>Last edited</TableCell>
                            {/* <TableCell className={tableStyle.col}>Description</TableCell> */}
                            <TableCell className={tableStyle.headCell}>Number of <br /> members</TableCell>
                            <TableCell className={tableStyle.headCell}>Your <br /> membership type</TableCell>
                            <TableCell />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {groups.map(group => (
                            <StyledTableRow key={group.info.group_id} className={tableStyle.tableItem}>
                                <TableCell component="th" scope="row" className={tableStyle.nameCol}>
                                    {group.metadata.name}
                                </TableCell>
                                <TableCell className={tableStyle.col}>{new Date(group.metadata.created).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</TableCell>
                                <TableCell className={tableStyle.col}>{new Date(group.metadata.lastEdited).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</TableCell>
                                {/* <TableCell align="right">{group.metadata.description}</TableCell> */}
                                <TableCell className={tableStyle.col}>{(group.members || []).length}</TableCell>
                                <TableCell className={tableStyle.col}>TODO</TableCell>
                                <TableCell className={tableStyle.col}><Link to={`/groups/${group.info.group_id}/admin-view`}>Admin View</Link></TableCell>
                            </StyledTableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
            {loading && <div>{'loading ...'}</div>}
            <br />
            <br />
            {/*<pre style={{ maxWidth: 400, overflowX: 'scroll' }}>*/}
            {/*    {JSON.stringify(groups, null, 2)}*/}
            {/*</pre>*/}
        </div>
    )
})
