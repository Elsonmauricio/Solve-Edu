import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// Estilos para o documento PDF, semelhante a CSS-in-JS
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 11,
        lineHeight: 1.5,
        color: '#333',
    },
    title: {
        fontSize: 16,
        textAlign: 'center',
        textTransform: 'uppercase',
        marginBottom: 30,
        fontFamily: 'Helvetica-Bold',
    },
    body: {
        textAlign: 'justify',
        marginBottom: 20,
    },
    list: {
        marginLeft: 20,
        marginBottom: 20,
    },
    listItem: {
        marginBottom: 2,
    },
    footer: {
        textAlign: 'left',
        marginTop: 40,
    },
    signature: {
        fontFamily: 'Helvetica-Bold',
    },
    date: {
        marginTop: 40,
        textAlign: 'right',
    }
});

// Tipos para as propriedades do componente
interface CertificateProps {
    studentName: string;
    courseName: string;
    schoolName: string;
    startDate: string;
    endDate: string;
    city: string;
    currentDate: string;
    studentEmail: string;
    studentPhone?: string;
}

const CertificateDocument: React.FC<CertificateProps> = ({
    studentName,
    courseName,
    schoolName,
    startDate,
    endDate,
    city,
    currentDate,
    studentEmail,
    studentPhone
}) => (
    <Document title={`Certificado - ${studentName}`}>
        <Page size="A4" style={styles.page}>
            <Text style={styles.title}>Declaração de Conclusão de Curso</Text>
            
            <Text style={styles.body}>
                Eu, {studentName}, declaro para os devidos fins que concluí, com êxito, o curso de {courseName}, realizado no período de {startDate} a {endDate}, na instituição {schoolName}.
            </Text>

            <Text style={styles.body}>
                O curso abordou os seguintes conteúdos programáticos:
            </Text>

            <View style={styles.list}>
                <Text style={styles.listItem}>- Lógica de Programação;</Text>
                <Text style={styles.listItem}>- Linguagens de Programação (ex: Python, Java, JavaScript, C#, etc.);</Text>
                <Text style={styles.listItem}>- Estruturas de Dados e Algoritmos;</Text>
                <Text style={styles.listItem}>- Banco de Dados e SQL;</Text>
                <Text style={styles.listItem}>- Desenvolvimento Web (HTML, CSS, React, etc.);</Text>
                <Text style={styles.listItem}>- Versionamento de Código (Git e GitHub);</Text>
                <Text style={styles.listItem}>- Metodologias de Desenvolvimento (Ágil, Scrum, etc.);</Text>
                <Text style={styles.listItem}>- entre outros temas relevantes para a formação de um programador.</Text>
            </View>

            <Text style={styles.body}>
                Esta declaração é fornecida para comprovar minha qualificação técnica na área de programação, estando ciente das responsabilidades legais inerentes à veracidade das informações aqui prestadas.
            </Text>

            <View style={styles.footer}>
                <Text>Atenciosamente,</Text>
                <Text style={styles.signature}>{studentName}</Text>
                <Text>{studentEmail}</Text>
                {studentPhone && <Text>{studentPhone}</Text>}
            </View>

            <Text style={styles.date}>
                {city}, {currentDate}
            </Text>
        </Page>
    </Document>
);

export default CertificateDocument;