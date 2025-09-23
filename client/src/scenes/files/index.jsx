import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Alert,
  useTheme,
  Chip,
  Backdrop,
} from "@mui/material";
import { 
  InsertDriveFileOutlined,
  UploadFileOutlined,
  DeleteOutlined,
  EditOutlined,
  ArrowBackOutlined,
  PlayCircleOutline as PlayCircleOutlineIcon,
} from "@mui/icons-material";
import Header from "components/Header";
import ProcessOptionsModal from "components/ProcessOptionsModal";
import { useSearch } from "contexts/SearchContext";
import axios from "axios";

const Files = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const fileInputRef = useRef(null);
  const updateFileInputRef = useRef(null);
  const { searchTerm } = useSearch();
  
  // Vérification de la présence du projectId - Protection d'accès
  useEffect(() => {
    if (!projectId) {
      // Si aucun projectId n'est fourni, rediriger vers la page des projets
      alert("Accès non autorisé. Veuillez sélectionner un projet d'abord.");
      navigate('/projects');
      return;
    }
  }, [projectId, navigate]);
  
  // État pour la gestion des données
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFileForUpdate, setSelectedFileForUpdate] = useState(null);
  
  // États pour la gestion du traitement
  const [processedFiles, setProcessedFiles] = useState([]);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [selectedFileForProcess, setSelectedFileForProcess] = useState(null);
  
  // États pour les indicateurs de chargement
  const [isDeletingFile, setIsDeletingFile] = useState(false);
  const [deletingFileName, setDeletingFileName] = useState(null);
  const [isUpdatingFile, setIsUpdatingFile] = useState(false);
  const [updatingFileName, setUpdatingFileName] = useState(null);

  // Filtrer les fichiers selon le terme de recherche
  const filteredFiles = files.filter(file => {
    console.log('File object:', file);
    console.log('File properties:', Object.keys(file));
    
    // Si pas de terme de recherche, retourner tous les fichiers
    if (!searchTerm || searchTerm.trim() === '') {
      return true;
    }
    
    // Chercher dans différentes propriétés possibles
    return file.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           file.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           file.originalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           file.asset_name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  console.log('Files:', files);
  console.log('Search term:', searchTerm);
  console.log('Filtered files:', filteredFiles);

  // Fonction pour récupérer la liste des fichiers
  const fetchFiles = async () => {
    if (!projectId) {
      setError("ID du projet manquant");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(`http://194.163.186.182/api/v1/data/assets/${projectId}`);
      
      console.log('Response data:', response.data);
      console.log('Type of response.data:', typeof response.data);
      console.log('Array.isArray(response.data):', Array.isArray(response.data));
      
      // S'assurer que les données sont un tableau
      let filesData = response.data;
      if (Array.isArray(filesData)) {
        console.log('Setting files directly:', filesData);
        setFiles(filesData);
      } else if (filesData && typeof filesData === 'object') {
        console.log('Extracting from object:', filesData.assets || filesData.data || []);
        setFiles(filesData.assets || filesData.data || []);
      } else {
        console.log('Setting empty array');
        setFiles([]);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Erreur lors du chargement des fichiers:', err);
      setError("Erreur lors du chargement des fichiers.");
      setFiles([]);
      setIsLoading(false);
    }
  };

  // Fonction pour uploader un nouveau fichier
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      await axios.post(`http://194.163.186.182/api/v1/data/upload/${projectId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert("Fichier téléchargé avec succès!");
      
      // Recharger la liste des fichiers
      await fetchFiles();
      
      // Réinitialiser l'input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (err) {
      console.error('Erreur lors du téléchargement:', err);
      alert("Erreur: Impossible de télécharger le fichier.");
    } finally {
      setIsUploading(false);
    }
  };

  // Fonction pour supprimer un fichier
  const handleDeleteFile = async (assetName) => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer le fichier "${assetName}" ? Cette action est irréversible.`
    );

    if (!confirmed) return;

    try {
      setIsDeletingFile(true);
      setDeletingFileName(assetName);
      
      await axios.delete(`http://194.163.186.182/api/v1/data/delete/${projectId}/${encodeURIComponent(assetName)}`);
      
      alert("Fichier supprimé avec succès!");
      
      // Recharger la liste des fichiers
      await fetchFiles();
      
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      alert("Erreur: Impossible de supprimer le fichier.");
    } finally {
      setIsDeletingFile(false);
      setDeletingFileName(null);
    }
  };

  // Fonction pour déclencher la mise à jour d'un fichier
  const handleUpdateFileClick = (assetName) => {
    setSelectedFileForUpdate(assetName);
    if (updateFileInputRef.current) {
      updateFileInputRef.current.click();
    }
  };

  // Fonction pour mettre à jour un fichier
  const handleFileUpdate = async (event) => {
    const file = event.target.files[0];
    if (!file || !selectedFileForUpdate) return;

    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir remplacer le fichier "${selectedFileForUpdate}" par le nouveau fichier sélectionné ?`
    );

    if (!confirmed) {
      setSelectedFileForUpdate(null);
      if (updateFileInputRef.current) {
        updateFileInputRef.current.value = '';
      }
      return;
    }

    try {
      setIsUpdatingFile(true);
      setUpdatingFileName(selectedFileForUpdate);
      
      const formData = new FormData();
      formData.append('file', file);

      await axios.put(
        `http://194.163.186.182/api/v1/data/update/${projectId}/${encodeURIComponent(selectedFileForUpdate)}`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      alert("Fichier mis à jour avec succès!");
      
      // Recharger la liste des fichiers
      await fetchFiles();
      
      // Réinitialiser
      setSelectedFileForUpdate(null);
      if (updateFileInputRef.current) {
        updateFileInputRef.current.value = '';
      }
      
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      alert("Erreur: Impossible de mettre à jour le fichier.");
    } finally {
      setIsUpdatingFile(false);
      setUpdatingFileName(null);
    }
  };

  // Fonction pour ouvrir la modal de traitement
  const handleProcessFileClick = (assetName) => {
    setSelectedFileForProcess(assetName);
    setIsProcessModalOpen(true);
  };

  // Fonction pour fermer la modal de traitement
  const handleCloseProcessModal = () => {
    setIsProcessModalOpen(false);
    setSelectedFileForProcess(null);
  };

  // Fonction appelée quand le traitement réussit
  const handleProcessSuccess = (fileName) => {
    // Ajouter le fichier à la liste des fichiers traités
    setProcessedFiles(prev => [...prev, fileName]);
  };

  // Fonction pour formater la taille du fichier
  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Date invalide';
    }
  };

  // Charger les fichiers au montage du composant
  useEffect(() => {
    fetchFiles();
  }, [projectId]);

  // Si pas de projectId, rediriger vers les projets
  // Cette page n'est accessible que depuis la page Projects
  if (!projectId) {
    return (
      <Box m="1.5rem 2.5rem">
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Accès Restreint
          </Typography>
          <Typography>
            Cette page n'est accessible que depuis la page des projets. 
            Veuillez sélectionner un projet pour gérer ses fichiers.
          </Typography>
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/projects')}
          sx={{ mt: 2 }}
        >
          Retour aux projets
        </Button>
      </Box>
    );
  }

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
          Chargement des fichiers...
        </Typography>
      </Box>
    );
  }

  return (
    <Box m="1.5rem 2.5rem">
      {/* Header avec bouton de retour */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton 
          onClick={() => navigate('/projects')}
          sx={{ 
            backgroundColor: theme.palette.background.alt,
            '&:hover': { backgroundColor: theme.palette.background.paper }
          }}
        >
          <ArrowBackOutlined />
        </IconButton>
        <Box flexGrow={1}>
          <Header 
            title={`FICHIERS DU PROJET`}
            subtitle={`Gérez les fichiers du projet: ${projectId}`}
          />
        </Box>
      </Box>

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

      {/* Section d'upload */}
      <Paper 
        elevation={3}
        sx={{ 
          p: 3, 
          mb: 3,
          backgroundColor: theme.palette.background.alt 
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <UploadFileOutlined />
          Télécharger un Nouveau Fichier
        </Typography>
        
        <Box display="flex" gap={2} alignItems="center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          
          <Button
            variant="contained"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            sx={{
              backgroundColor: theme.palette.secondary.main,
              '&:hover': {
                backgroundColor: theme.palette.secondary.dark,
              }
            }}
          >
            {isUploading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Téléchargement...
              </>
            ) : (
              'Choisir un Fichier'
            )}
          </Button>
        </Box>
        
        {/* Input caché pour la mise à jour */}
        <input
          type="file"
          ref={updateFileInputRef}
          onChange={handleFileUpdate}
          style={{ display: 'none' }}
        />
      </Paper>

      {/* Liste des fichiers */}
      <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
        Fichiers {searchTerm ? `Filtrés (${filteredFiles.length}/${files.length})` : `Existants (${Array.isArray(files) ? files.length : 0})`}
      </Typography>

      {!Array.isArray(files) || files.length === 0 ? (
        <Paper 
          elevation={1}
          sx={{ 
            p: 4, 
            textAlign: 'center',
            backgroundColor: theme.palette.background.alt 
          }}
        >
          <InsertDriveFileOutlined sx={{ fontSize: 60, color: theme.palette.text.secondary, mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            Aucun fichier trouvé
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Téléchargez votre premier fichier en utilisant le formulaire ci-dessus.
          </Typography>
        </Paper>
      ) : searchTerm && filteredFiles.length === 0 ? (
        <Paper 
          elevation={1}
          sx={{ 
            p: 4, 
            textAlign: 'center',
            backgroundColor: theme.palette.background.alt 
          }}
        >
          <InsertDriveFileOutlined sx={{ fontSize: 60, color: theme.palette.text.secondary, mb: 2 }} />
          <Typography variant="h6" color="textSecondiary">
            Aucun fichier correspondant à "{searchTerm}"
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Essayez de modifier votre terme de recherche.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.background.alt }}>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <InsertDriveFileOutlined fontSize="small" />
                    Nom du Fichier
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Taille</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date d'Ajout</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredFiles.map((file, index) => (
                <TableRow 
                  key={file.asset_name || index}
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: theme.palette.background.alt + '50' 
                    } 
                  }}
                >
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <InsertDriveFileOutlined 
                        sx={{ color: theme.palette.secondary.main }}
                      />
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {file.asset_name || `Fichier ${index + 1}`}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={formatFileSize(file.asset_size)}
                      variant="outlined"
                      size="small"
                      sx={{ 
                        backgroundColor: theme.palette.info.main + '15',
                        borderColor: theme.palette.info.main,
                        color: theme.palette.info.main
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {formatDate(file.asset_pushed_at)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" gap={1} justifyContent="center">
                      <IconButton
                        size="small"
                        onClick={() => handleProcessFileClick(file.asset_name)}
                        disabled={processedFiles.includes(file.asset_name)}
                        sx={{
                          color: processedFiles.includes(file.asset_name) 
                            ? theme.palette.text.disabled 
                            : theme.palette.success.main,
                          '&:hover': {
                            backgroundColor: processedFiles.includes(file.asset_name) 
                              ? 'transparent' 
                              : theme.palette.success.main + '15',
                          },
                          '&:disabled': {
                            color: theme.palette.text.disabled,
                          }
                        }}
                        title={processedFiles.includes(file.asset_name) 
                          ? "Fichier déjà traité" 
                          : "Traiter le fichier"
                        }
                      >
                        <PlayCircleOutlineIcon fontSize="small" />
                      </IconButton>
                      
                      <IconButton
                        size="small"
                        onClick={() => handleUpdateFileClick(file.asset_name)}
                        disabled={isUpdatingFile && updatingFileName === file.asset_name}
                        sx={{
                          color: isUpdatingFile && updatingFileName === file.asset_name 
                            ? theme.palette.grey[500] 
                            : theme.palette.warning.main,
                          '&:hover': {
                            backgroundColor: theme.palette.warning.main + '15',
                          },
                          opacity: isUpdatingFile && updatingFileName === file.asset_name ? 0.5 : 1,
                        }}
                        title={isUpdatingFile && updatingFileName === file.asset_name 
                          ? "Mise à jour en cours..." 
                          : "Mettre à jour le fichier"}
                      >
                        {isUpdatingFile && updatingFileName === file.asset_name ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          <EditOutlined fontSize="small" />
                        )}
                      </IconButton>
                      
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteFile(file.asset_name)}
                        disabled={isDeletingFile && deletingFileName === file.asset_name}
                        sx={{
                          color: isDeletingFile && deletingFileName === file.asset_name 
                            ? theme.palette.grey[500] 
                            : theme.palette.error.main,
                          '&:hover': {
                            backgroundColor: theme.palette.error.main + '15',
                          },
                          opacity: isDeletingFile && deletingFileName === file.asset_name ? 0.5 : 1,
                        }}
                        title={isDeletingFile && deletingFileName === file.asset_name 
                          ? "Suppression en cours..." 
                          : "Supprimer le fichier"}
                      >
                        {isDeletingFile && deletingFileName === file.asset_name ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          <DeleteOutlined fontSize="small" />
                        )}
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal de traitement */}
      <ProcessOptionsModal
        open={isProcessModalOpen}
        onClose={handleCloseProcessModal}
        projectId={projectId}
        fileName={selectedFileForProcess}
        onProcessSuccess={handleProcessSuccess}
      />

      {/* Backdrop pour la suppression de fichier */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(0, 0, 0, 0.7)'
        }}
        open={isDeletingFile}
      >
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <CircularProgress size={60} color="inherit" />
          <Typography variant="h6" color="inherit">
            Suppression du fichier en cours...
          </Typography>
          <Typography variant="body2" color="inherit">
            Fichier: {deletingFileName}
          </Typography>
          <Typography variant="body2" color="inherit">
            Veuillez patienter...
          </Typography>
        </Box>
      </Backdrop>

      {/* Backdrop pour la mise à jour de fichier */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(0, 0, 0, 0.7)'
        }}
        open={isUpdatingFile}
      >
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <CircularProgress size={60} color="inherit" />
          <Typography variant="h6" color="inherit">
            Mise à jour du fichier en cours...
          </Typography>
          <Typography variant="body2" color="inherit">
            Fichier: {updatingFileName}
          </Typography>
          <Typography variant="body2" color="inherit">
            Veuillez patienter...
          </Typography>
        </Box>
      </Backdrop>
    </Box>
  );
};

export default Files;