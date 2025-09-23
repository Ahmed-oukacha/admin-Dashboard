import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Paper,
  useTheme,
  GlobalStyles,
  IconButton,
  Backdrop,
  Chip,
} from "@mui/material";
import { 
  FolderOutlined, 
  AddOutlined,
  DeleteOutlined,
  StorageOutlined,
  RefreshOutlined
} from "@mui/icons-material";
import Header from "components/Header";
import IndexingModal from "components/IndexingModal";
import { useSearch } from "contexts/SearchContext";
import axios from "axios";

// Animations CSS personnalisées
const animationStyles = (
  <GlobalStyles
    styles={{
      '@keyframes pulse': {
        '0%': {
          transform: 'scale(1)',
          opacity: 0.5,
        },
        '50%': {
          transform: 'scale(1.05)',
          opacity: 0.8,
        },
        '100%': {
          transform: 'scale(1)',
          opacity: 0.5,
        },
      },
      '@keyframes bounce': {
        '0%, 20%, 50%, 80%, 100%': {
          transform: 'translateY(0)',
        },
        '40%': {
          transform: 'translateY(-10px)',
        },
        '60%': {
          transform: 'translateY(-5px)',
        },
      },
      '@keyframes fadeInUp': {
        'from': {
          opacity: 0,
          transform: 'translateY(30px)',
        },
        'to': {
          opacity: 1,
          transform: 'translateY(0)',
        },
      },
    }}
  />
);

const Projects = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { searchTerm } = useSearch();
  
  // État pour la gestion des données
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newProjectId, setNewProjectId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  // États pour la gestion de l'indexation
  const [isIndexingModalOpen, setIsIndexingModalOpen] = useState(false);
  const [selectedProjectForIndexing, setSelectedProjectForIndexing] = useState(null);
  
  // États pour les indicateurs de chargement
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState(null);

  // Filtrer les projets en fonction du terme de recherche
  const filteredProjects = projects.filter((project) =>
    project.project_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fonction pour récupérer la liste des projets avec leurs informations d'indexation
  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Récupérer la liste des projets
      const response = await axios.get('http://194.163.186.182/api/v1/data/projects');
      
      // S'assurer que les données sont un tableau
      let projectsData = response.data;
      if (Array.isArray(projectsData)) {
        // Ne rien faire, c'est déjà un tableau
      } else if (projectsData && typeof projectsData === 'object') {
        // Si c'est un objet, essayer d'extraire le tableau des projets
        projectsData = projectsData.projects || projectsData.data || [];
      } else {
        projectsData = [];
      }

      // Récupérer les informations d'indexation pour chaque projet en parallèle
      const projectsWithIndexInfo = await Promise.all(
        projectsData.map(async (project) => {
          const projectId = typeof project === 'string' ? project : project.project_id;
          
          try {
            // Timeout de 5 secondes pour éviter les blocages
            const indexInfoResponse = await axios.get(
              `http://194.163.186.182/api/v1/nlp/index/info/${projectId}`,
              {
                timeout: 5000,
                // Essayer de contourner CORS en ajoutant des headers
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            );
            
            const vectorsCount = indexInfoResponse.data?.collection_info?.vectors_count || 
                               indexInfoResponse.data?.collection_info?.points_count || 
                               0;
            
            return {
              project_id: projectId,
              indexedCount: vectorsCount
            };
          } catch (indexError) {
            console.warn(`Impossible de récupérer les informations d'indexation pour le projet ${projectId}:`, indexError.message);
            
            // Retourner des données par défaut en cas d'erreur
            return {
              project_id: projectId,
              indexedCount: null // null pour indiquer que l'information n'est pas disponible
            };
          }
        })
      );

      setProjects(projectsWithIndexInfo);
      setIsLoading(false);
    } catch (err) {
      console.error('Erreur lors du chargement des projets:', err);
      setError("Erreur lors du chargement des projets.");
      setProjects([]); // S'assurer que projects reste un tableau
      setIsLoading(false);
    }
  };

  // Fonction pour rafraîchir les informations d'indexation d'un projet spécifique
  const refreshProjectIndexInfo = async (projectId) => {
    try {
      const indexInfoResponse = await axios.get(
        `http://194.163.186.182/api/v1/nlp/index/info/${projectId}`,
        {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      const vectorsCount = indexInfoResponse.data?.collection_info?.vectors_count || 
                         indexInfoResponse.data?.collection_info?.points_count || 
                         0;
      
      // Mettre à jour uniquement ce projet dans la liste
      setProjects(prevProjects => 
        prevProjects.map(project => 
          project.project_id === projectId 
            ? { ...project, indexedCount: vectorsCount }
            : project
        )
      );
      
    } catch (error) {
      console.warn(`Impossible de rafraîchir les informations d'indexation pour le projet ${projectId}:`, error.message);
      // En cas d'erreur, on peut choisir de laisser les données actuelles ou de les marquer comme indisponibles
    }
  };

  // Fonction pour créer un nouveau projet
  const handleCreateProject = async () => {
    if (!newProjectId.trim()) {
      alert("Veuillez saisir un ID de projet valide.");
      return;
    }

    try {
      setIsCreating(true);
      await axios.post('http://194.163.186.182/api/v1/data/projects', {
        project_id: newProjectId
      });
      
      // Afficher un message de succès
      alert("Projet créé avec succès!");
      
      // Vider le champ de saisie
      setNewProjectId('');
      
      // Recharger la liste des projets pour afficher le nouveau projet
      await fetchProjects();
      
    } catch (err) {
      console.error('Erreur lors de la création du projet:', err);
      alert("Erreur: Impossible de créer le projet.");
    } finally {
      setIsCreating(false);
    }
  };

  // Fonction pour naviguer vers les fichiers d'un projet
  const handleViewProjectFiles = (projectId) => {
    navigate(`/files/${projectId}`);
  };

  // Fonction wrapper pour l'actualisation des informations d'indexation
  const handleRefreshIndexInfo = (projectId) => {
    refreshProjectIndexInfo(projectId);
  };

  // Fonction pour supprimer un projet
  const handleDeleteProject = async (projectId) => {
    // Demander confirmation à l'utilisateur
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible."
    );

    if (!confirmed) {
      return; // L'utilisateur a annulé
    }

    try {
      setIsDeletingProject(true);
      setDeletingProjectId(projectId);
      
      // Supprimer le projet via l'API
      await axios.delete(`http://194.163.186.182/api/v1/data/projects/${projectId}`);
      
      // Afficher un message de succès
      alert("Projet supprimé avec succès!");
      
      // Recharger la liste des projets pour mettre à jour l'affichage
      await fetchProjects();
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      alert("Erreur: Impossible de supprimer le projet.");
    } finally {
      setIsDeletingProject(false);
      setDeletingProjectId(null);
    }
  };

  // Charger les projets au montage du composant
  useEffect(() => {
    fetchProjects();
  }, []);

  // Fonction pour ouvrir la modal d'indexation
  const handleOpenIndexingModal = (projectId) => {
    setSelectedProjectForIndexing(projectId);
    setIsIndexingModalOpen(true);
  };

  // Fonction pour fermer la modal d'indexation
  const handleCloseIndexingModal = () => {
    setIsIndexingModalOpen(false);
    setSelectedProjectForIndexing(null);
  };

  // Affichage du loading
  if (isLoading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="50vh"
        gap={2}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="textSecondary">
          Chargement des projets...
        </Typography>
      </Box>
    );
  }

  return (
    <>
      {animationStyles}
      <Box m="1.5rem 2.5rem">
        <Header 
          title="GESTION DES PROJETS" 
          subtitle="Gérez vos projets RAG et créez de nouveaux projets"
        />

      {/* Affichage des erreurs */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Formulaire de création de projet */}
      <Paper 
        elevation={3}
        sx={{ 
          p: 3, 
          mb: 3,
          backgroundColor: theme.palette.background.alt 
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AddOutlined />
          Créer un Nouveau Projet
        </Typography>
        
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            label="ID du Nouveau Projet"
            variant="outlined"
            value={newProjectId}
            onChange={(e) => setNewProjectId(e.target.value)}
            placeholder="Saisissez l'ID du projet..."
            size="medium"
            sx={{ 
              minWidth: 300,
              '& .MuiOutlinedInput-root': {
                backgroundColor: theme.palette.background.paper,
              }
            }}
            disabled={isCreating}
          />
          
          <Button
            variant="contained"
            onClick={handleCreateProject}
            disabled={isCreating || !newProjectId.trim()}
            sx={{
              minWidth: 150,
              height: 56,
              backgroundColor: theme.palette.secondary.main,
              '&:hover': {
                backgroundColor: theme.palette.secondary.dark,
              }
            }}
          >
            {isCreating ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Création...
              </>
            ) : (
              'Créer le Projet'
            )}
          </Button>
        </Box>
      </Paper>

      {/* Liste des projets */}
      <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
        Projets Existants ({Array.isArray(projects) ? projects.length : 0})
      </Typography>

      {!Array.isArray(projects) || projects.length === 0 ? (
        <Box
          sx={{ 
            p: 6, 
            textAlign: 'center',
            background: `linear-gradient(135deg, ${theme.palette.background.alt} 0%, ${theme.palette.background.paper} 100%)`,
            borderRadius: '20px',
            border: `2px dashed ${theme.palette.divider}`,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: `radial-gradient(circle, ${theme.palette.secondary.main}08 0%, transparent 70%)`,
              animation: 'pulse 3s ease-in-out infinite',
            },
          }}
        >
          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
            }}
          >
            <Box
              sx={{
                width: 120,
                height: 120,
                margin: '0 auto 2rem',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${theme.palette.secondary.main}15, ${theme.palette.primary.main}15)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `3px solid ${theme.palette.secondary.main}30`,
              }}
            >
              <FolderOutlined 
                sx={{ 
                  fontSize: 48, 
                  color: theme.palette.secondary.main,
                  opacity: 0.8,
                }} 
              />
            </Box>
            
            <Typography 
              variant="h5" 
              sx={{ 
                color: theme.palette.text.primary,
                fontWeight: 600,
                mb: 1,
              }}
            >
              Aucun projet trouvé
            </Typography>
            
            <Typography 
              variant="body1" 
              sx={{ 
                color: theme.palette.text.secondary,
                maxWidth: 400,
                margin: '0 auto',
                lineHeight: 1.6,
              }}
            >
              Commencez votre aventure RAG en créant votre premier projet. 
              Utilisez le formulaire ci-dessus pour démarrer.
            </Typography>
            
            <Box
              sx={{
                mt: 3,
                display: 'flex',
                justifyContent: 'center',
                gap: 1,
              }}
            >
              {[...Array(3)].map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: theme.palette.secondary.main,
                    opacity: 0.3 + (i * 0.2),
                    animation: `bounce 1.5s ease-in-out infinite ${i * 0.2}s`,
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {Array.isArray(filteredProjects) && filteredProjects.map((project, index) => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={4} 
              lg={3} 
              key={project.project_id || index}
              sx={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
              }}
            >
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  background: `linear-gradient(135deg, ${theme.palette.background.alt} 0%, ${theme.palette.background.paper} 100%)`,
                  border: `2px solid transparent`,
                  borderRadius: '16px',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                    borderRadius: '16px 16px 0 0',
                  },
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: `0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 2px ${theme.palette.secondary.main}33`,
                    cursor: 'pointer',
                    '& .project-icon': {
                      transform: 'rotate(10deg) scale(1.2)',
                      color: theme.palette.secondary.light,
                    },
                    '& .project-id': {
                      backgroundColor: theme.palette.secondary.main + '15',
                      borderColor: theme.palette.secondary.main,
                      color: theme.palette.secondary.main,
                    }
                  }
                }}
                onClick={() => handleViewProjectFiles(project.project_id)}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  {/* Header avec icône et titre */}
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '12px',
                          background: `linear-gradient(135deg, ${theme.palette.secondary.main}20, ${theme.palette.primary.main}20)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <FolderOutlined 
                          className="project-icon"
                          sx={{ 
                            color: theme.palette.secondary.main,
                            fontSize: 24,
                            transition: 'all 0.3s ease',
                          }} 
                        />
                      </Box>
                      <Typography 
                        variant="h6" 
                        component="h3"
                        sx={{ 
                          fontWeight: 700,
                          color: theme.palette.text.primary,
                          fontSize: '1.1rem',
                        }}
                      >
                        Projet RAG
                      </Typography>
                    </Box>
                    
                    {/* Boutons d'actions */}
                    <Box display="flex" gap={1}>
                      {/* Bouton d'indexation */}
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenIndexingModal(project.project_id);
                        }}
                        size="small"
                        sx={{
                          color: theme.palette.mode === 'dark' 
                            ? theme.palette.secondary.main 
                            : '#1976d2', // أزرق داكن للوضع الفاتح
                          backgroundColor: theme.palette.mode === 'dark' 
                            ? 'rgba(144, 202, 249, 0.1)' 
                            : 'rgba(25, 118, 210, 0.1)', // خلفية خفيفة
                          '&:hover': {
                            backgroundColor: theme.palette.mode === 'dark'
                              ? theme.palette.secondary.main + '25'
                              : 'rgba(25, 118, 210, 0.2)',
                            transform: 'scale(1.1)',
                            color: theme.palette.mode === 'dark' 
                              ? theme.palette.secondary.light 
                              : '#0d47a1', // أزرق أكثر قتامة عند التمرير
                          },
                          transition: 'all 0.2s ease',
                          border: `1px solid ${theme.palette.mode === 'dark' 
                            ? theme.palette.secondary.main + '40' 
                            : 'rgba(25, 118, 210, 0.3)'}`,
                        }}
                        title="Indexer le projet"
                      >
                        <StorageOutlined />
                      </IconButton>
                      
                      {/* Bouton de suppression */}
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project.project_id);
                        }}
                        size="small"
                        disabled={isDeletingProject && deletingProjectId === project.project_id}
                        sx={{
                          color: isDeletingProject && deletingProjectId === project.project_id 
                            ? theme.palette.grey[500] 
                            : theme.palette.error.main,
                          '&:hover': {
                            backgroundColor: theme.palette.error.main + '15',
                            transform: 'scale(1.1)',
                          },
                          transition: 'all 0.2s ease',
                          opacity: isDeletingProject && deletingProjectId === project.project_id ? 0.5 : 1,
                        }}
                        title={isDeletingProject && deletingProjectId === project.project_id 
                          ? "Suppression en cours..." 
                          : "Supprimer le projet"}
                      >
                        {isDeletingProject && deletingProjectId === project.project_id ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <DeleteOutlined />
                        )}
                      </IconButton>
                    </Box>
                  </Box>
                  
                  {/* Badge de statut et معلومات الفهرسة في سطر واحد */}
                  <Box 
                    display="flex" 
                    alignItems="center" 
                    justifyContent="space-between" 
                    mb={2}
                  >
                    {/* Badge الحالة */}
                    <Chip
                      label="Actif"
                      size="small"
                      sx={{
                        fontSize: '0.7rem',
                        height: '22px',
                        backgroundColor: theme.palette.mode === 'dark' 
                          ? theme.palette.success.main + '15' 
                          : '#e8f5e8',
                        borderColor: theme.palette.success.main,
                        color: theme.palette.mode === 'dark' 
                          ? theme.palette.success.main 
                          : '#2e7d32',
                        fontWeight: 'bold',
                        border: `1px solid ${theme.palette.success.main}`,
                      }}
                    />
                    
                    {/* عداد المستندات المفهرسة مدمج */}
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
                        Docs:
                      </Typography>
                      {project.indexedCount === null ? (
                        <Box display="flex" alignItems="center" gap={0.3}>
                          <CircularProgress size={10} />
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRefreshIndexInfo(project.projectId);
                            }}
                            sx={{ 
                              padding: '2px',
                              '&:hover': { backgroundColor: theme.palette.action.hover }
                            }}
                            title="Actualiser"
                          >
                            <RefreshOutlined sx={{ fontSize: '10px' }} />
                          </IconButton>
                        </Box>
                      ) : project.indexedCount === 'error' ? (
                        <Box display="flex" alignItems="center" gap={0.3}>
                          <Chip
                            label="N/A"
                            size="small"
                            sx={{
                              fontSize: '0.6rem',
                              height: '16px',
                              backgroundColor: theme.palette.mode === 'dark' 
                                ? theme.palette.error.main + '15' 
                                : '#ffebee',
                              color: theme.palette.mode === 'dark' 
                                ? theme.palette.error.main 
                                : '#c62828',
                              borderColor: theme.palette.error.main,
                              minWidth: '28px',
                              border: `1px solid ${theme.palette.error.main}`,
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRefreshIndexInfo(project.projectId);
                            }}
                            sx={{ 
                              padding: '2px',
                              color: theme.palette.error.main,
                              '&:hover': { backgroundColor: theme.palette.error.main + '15' }
                            }}
                            title="Réessayer"
                          >
                            <RefreshOutlined sx={{ fontSize: '10px' }} />
                          </IconButton>
                        </Box>
                      ) : (
                        <Chip
                          label={project.indexedCount}
                          size="small"
                          sx={{
                            fontSize: '0.6rem',
                            height: '16px',
                            backgroundColor: project.indexedCount > 0 
                              ? (theme.palette.mode === 'dark' 
                                  ? theme.palette.primary.main + '25' 
                                  : '#e3f2fd')
                              : (theme.palette.mode === 'dark' 
                                  ? theme.palette.grey[700] 
                                  : '#f5f5f5'),
                            color: project.indexedCount > 0 
                              ? (theme.palette.mode === 'dark' 
                                  ? theme.palette.primary.main 
                                  : '#1565c0')
                              : theme.palette.text.secondary,
                            fontWeight: 'bold',
                            minWidth: '28px',
                            border: project.indexedCount > 0 
                              ? `1px solid ${theme.palette.mode === 'dark' 
                                  ? theme.palette.primary.main 
                                  : '#1976d2'}` 
                              : `1px solid ${theme.palette.grey[400]}`,
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                  
                  {/* Label pour l'ID du projet */}
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: theme.palette.text.secondary,
                      fontWeight: 600,
                      mb: 1,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontSize: '0.8rem',
                    }}
                  >
                    ID du Projet :
                  </Typography>
                  
                  {/* ID du projet avec style amélioré */}
                  <Box
                    className="project-id"
                    sx={{ 
                      fontFamily: '"Fira Code", "Monaco", monospace',
                      backgroundColor: theme.palette.background.paper,
                      p: 2,
                      borderRadius: '12px',
                      border: `2px solid ${theme.palette.divider}`,
                      wordBreak: 'break-all',
                      position: 'relative',
                      transition: 'all 0.3s ease',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: `linear-gradient(45deg, transparent 30%, ${theme.palette.secondary.main}05 50%, transparent 70%)`,
                        pointerEvents: 'none',
                      }
                    }}
                  >
                    <Typography 
                      variant="body1"
                      sx={{ 
                        fontWeight: 600,
                        color: theme.palette.text.primary,
                        fontSize: '0.95rem',
                        position: 'relative',
                        zIndex: 1,
                      }}
                    >
                      {project.project_id || `Projet ${index + 1}`}
                    </Typography>
                  </Box>

                  {/* Métadonnées avec icônes */}
                  <Box mt={3} display="flex" alignItems="center" justifyContent="space-between">
                    {project.created_at && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: theme.palette.info.main,
                          }}
                        />
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: theme.palette.text.secondary,
                            fontWeight: 500,
                            fontSize: '0.8rem',
                          }}
                        >
                          {new Date(project.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </Typography>
                      </Box>
                    )}
                    
                    {/* Indicateur de projet */}
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: theme.palette.success.main,
                          boxShadow: `0 0 10px ${theme.palette.success.main}40`,
                        }}
                      />
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: theme.palette.success.main,
                          fontWeight: 600,
                          fontSize: '0.75rem',
                        }}
                      >
                        En ligne
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      </Box>

      {/* Modal d'indexation */}
      <IndexingModal
        open={isIndexingModalOpen}
        onClose={handleCloseIndexingModal}
        projectId={selectedProjectForIndexing}
      />

      {/* Backdrop pour la suppression de projet */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(0, 0, 0, 0.7)'
        }}
        open={isDeletingProject}
      >
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <CircularProgress size={60} color="inherit" />
          <Typography variant="h6" color="inherit">
            Suppression du projet en cours...
          </Typography>
          <Typography variant="body2" color="inherit">
            Veuillez patienter...
          </Typography>
        </Box>
      </Backdrop>
    </>
  );
};

export default Projects;