import pageStyles from '@/styles/Page.module.css';

interface Props {
    name: string;
    studentId: string;
    email: string;
}

const Member: React.FC<Props> = ({ name, studentId, email }) => {
    return (
        <>
            <div className={pageStyles['horizontal-container']}>
                <p>{name}</p>
                <p>{studentId}</p>
                <p>{email}</p>
            </div>
            <hr className={pageStyles['divider']}></hr>
        </>
    );
}

export default Member;