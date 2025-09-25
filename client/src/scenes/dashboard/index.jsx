import React, { useState, useEffect } from "react";
import { Box, Typography, useTheme, CircularProgress, IconButton, Alert } from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Refresh } from "@mui/icons-material";
import Header from "components/Header";
import StatBox from "components/StatBox";
import axios from 'axios';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B'];

const Dashboard = () => {
  const theme = useTheme();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoData, setIsDemoData] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      // const response = await axios.get('http://localhost:5001/general/dashboard-stats', {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/general/dashboard-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(response.data.data);
      setIsDemoData(response.data.isDemoData || false);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatFileTypeData = () => {
    if (!dashboardData?.fileTypeDistribution) return [];
    
    return Object.entries(dashboardData.fileTypeDistribution).map(([type, count]) => ({
      name: type.toUpperCase(),
      value: count,
      percentage: Math.round((count / dashboardData.totalDocuments) * 100)
    }));
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            p: 2,
            boxShadow: theme.shadows[3],
          }}
        >
          <Typography variant="body2" color={theme.palette.text.primary}>
            {`${data.name}: ${data.value} fichiers (${data.payload.percentage}%)`}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
        <Typography ml={2}>Chargement des statistiques...</Typography>
      </Box>
    );
  }

  return (
    <Box m="1.5rem 2.5rem">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="ASKSOURCE DASHBOARD" subtitle="Aperçu de votre système RAG" />
        <IconButton
          onClick={fetchDashboardData}
          disabled={isLoading}
          sx={{
            backgroundColor: theme.palette.secondary.light,
            "&:hover": {
              backgroundColor: theme.palette.secondary.main,
            },
          }}
        >
          <Refresh />
        </IconButton>
      </Box>
      
      {/* إشعار البيانات التجريبية */}
      {isDemoData && (
        <Alert severity="info" sx={{ mt: 2 }}>
          📊 هذه بيانات تجريبية للاختبار. قم بإضافة مشاريع وملفات لرؤية البيانات الحقيقية.
        </Alert>
      )}
      
      <Box mt="20px" display="grid" gridTemplateColumns="repeat(4, 1fr)" gap="20px">
        <StatBox
          title="Projets Totaux"
          value={dashboardData?.totalProjects || 0}
          description="Projets actifs"
        />
        <StatBox
          title="Documents Totaux"
          value={dashboardData?.totalDocuments || 0}
          description="Fichiers uploadés"
        />
        <StatBox
          title="Documents Indexés"
          value={dashboardData?.totalIndexedDocuments || 0}
          description="Prêts pour recherche"
        />
        <StatBox
          title="Progression"
          value={`${dashboardData?.indexingProgress || 0}%`}
          description="Indexation complète"
        />
      </Box>
      
      {/* Graphique de distribution des types de fichiers */}
      <Box mt="40px" height="400px">
        <Header title="Distribution des Types de Fichiers" />
        <Box
          mt="20px"
          p="20px"
          backgroundColor={theme.palette.background.alt}
          borderRadius="10px"
          height="350px"
        >
          {formatFileTypeData().length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formatFileTypeData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {formatFileTypeData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <Typography variant="h6" color={theme.palette.text.secondary}>
                Aucune donnée de fichier disponible
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;