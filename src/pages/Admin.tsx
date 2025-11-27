import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Edit, Trash2, Shield, Users } from "lucide-react";
import { masterDataService } from "@/services/masterDataService";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [currentEntity, setCurrentEntity] = useState("");
  const [currentCategory, setCurrentCategory] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  const { data: consultants = [] } = useQuery({
    queryKey: ["consultants"],
    queryFn: () => masterDataService.getConsultants(),
    enabled: !!user,
  });

  const { data: complaints = [] } = useQuery({
    queryKey: ["chief-complaints"],
    queryFn: () => masterDataService.getMasterData("CHIEF_COMPLAINT"),
    enabled: !!user,
  });

  const { data: findings = [] } = useQuery({
    queryKey: ["findings"],
    queryFn: () => masterDataService.getMasterData("FINDING"),
    enabled: !!user,
  });

  const { data: diagnoses = [] } = useQuery({
    queryKey: ["diagnoses"],
    queryFn: () => masterDataService.getMasterData("DIAGNOSIS"),
    enabled: !!user,
  });

  const { data: drugs = [] } = useQuery({
    queryKey: ["drugs"],
    queryFn: () => masterDataService.getDrugs(),
    enabled: !!user,
  });

  const { data: advice = [] } = useQuery({
    queryKey: ["advice"],
    queryFn: () => masterDataService.getMasterData("ADVICE"),
    enabled: !!user,
  });

  const openAddDialog = (entity: string, category: string = "", item?: any) => {
    setCurrentEntity(entity);
    setCurrentCategory(category);
    setEditingItem(item || null);
    setShowAddDialog(true);
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      if (currentEntity === "consultant") {
        return await masterDataService.createConsultant(data);
      } else if (currentEntity === "drug") {
        return await masterDataService.createDrug(data);
      } else {
        return await masterDataService.createMasterData(currentCategory, data);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `${currentEntity} has been added successfully`,
      });
      setShowAddDialog(false);
      setEditingItem(null);
      queryClient.invalidateQueries({ queryKey: [currentEntity === "consultant" ? "consultants" : currentEntity === "drug" ? "drugs" : currentCategory.toLowerCase().replace("_", "-")] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add item",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      if (currentEntity === "consultant") {
        return await masterDataService.updateConsultant(id, data);
      } else if (currentEntity === "drug") {
        return await masterDataService.updateDrug(id, data);
      } else {
        return await masterDataService.updateMasterData(id, data);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `${currentEntity} has been updated successfully`,
      });
      setShowAddDialog(false);
      setEditingItem(null);
      queryClient.invalidateQueries({ queryKey: [currentEntity === "consultant" ? "consultants" : currentEntity === "drug" ? "drugs" : currentCategory.toLowerCase().replace("_", "-")] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update item",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id, entity, category }: { id: string; entity: string; category: string }) => {
      if (entity === "consultant") {
        return await masterDataService.deleteConsultant(id);
      } else if (entity === "drug") {
        return await masterDataService.deleteDrug(id);
      } else {
        return await masterDataService.deleteMasterData(id);
      }
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Success",
        description: `${variables.entity} has been deleted successfully`,
      });
      queryClient.invalidateQueries({ queryKey: [variables.entity === "consultant" ? "consultants" : variables.entity === "drug" ? "drugs" : variables.category.toLowerCase().replace("_", "-")] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete item",
        variant: "destructive",
      });
    },
  });

  const handleSaveEntity = async (formData: any) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDeleteEntity = async (entity: string, category: string, id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    deleteMutation.mutate({ id, entity, category });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="bg-background">
      <div className="p-6">
        <Tabs defaultValue="consultants" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="consultants">Consultants</TabsTrigger>
            <TabsTrigger value="complaints">Chief Complaints</TabsTrigger>
            <TabsTrigger value="findings">Findings</TabsTrigger>
            <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
            <TabsTrigger value="drugs">Drugs</TabsTrigger>
            <TabsTrigger value="advice">Advice</TabsTrigger>
          </TabsList>

          <TabsContent value="consultants">
            <MasterDataTable
              title="Consultants"
              description="Manage doctors and consultants"
              data={consultants}
              columns={["name", "specialization", "qualification"]}
              columnHeaders={["Name", "Specialization", "Qualification"]}
              onAdd={() => openAddDialog("consultant")}
              onEdit={(item) => openAddDialog("consultant", "", item)}
              onDelete={(id) => handleDeleteEntity("consultant", "", id)}
            />
          </TabsContent>

          <TabsContent value="complaints">
            <MasterDataTable
              title="Chief Complaints"
              description="Manage patient complaint options"
              data={complaints}
              columns={["name", "description"]}
              columnHeaders={["Complaint", "Description"]}
              onAdd={() => openAddDialog("complaint", "CHIEF_COMPLAINT")}
              onEdit={(item) => openAddDialog("complaint", "CHIEF_COMPLAINT", item)}
              onDelete={(id) => handleDeleteEntity("complaint", "CHIEF_COMPLAINT", id)}
            />
          </TabsContent>

          <TabsContent value="findings">
            <MasterDataTable
              title="Clinical Findings"
              description="Manage clinical finding options"
              data={findings}
              columns={["name", "description"]}
              columnHeaders={["Finding", "Description"]}
              onAdd={() => openAddDialog("finding", "FINDING")}
              onEdit={(item) => openAddDialog("finding", "FINDING", item)}
              onDelete={(id) => handleDeleteEntity("finding", "FINDING", id)}
            />
          </TabsContent>

          <TabsContent value="diagnosis">
            <MasterDataTable
              title="Diagnosis"
              description="Manage diagnosis options with ICD codes"
              data={diagnoses}
              columns={["name", "code", "description"]}
              columnHeaders={["Diagnosis", "ICD Code", "Description"]}
              onAdd={() => openAddDialog("diagnosis", "DIAGNOSIS")}
              onEdit={(item) => openAddDialog("diagnosis", "DIAGNOSIS", item)}
              onDelete={(id) => handleDeleteEntity("diagnosis", "DIAGNOSIS", id)}
            />
          </TabsContent>

          <TabsContent value="drugs">
            <MasterDataTable
              title="Drugs & Medications"
              description="Manage drug inventory and pricing"
              data={drugs}
              columns={["name", "category", "strength", "price", "stockQuantity"]}
              columnHeaders={["Drug Name", "Category", "Strength", "Price", "Stock"]}
              onAdd={() => openAddDialog("drug")}
              onEdit={(item) => openAddDialog("drug", "", item)}
              onDelete={(id) => handleDeleteEntity("drug", "", id)}
            />
          </TabsContent>

          <TabsContent value="advice">
            <MasterDataTable
              title="Patient Advice"
              description="Manage patient advice options"
              data={advice}
              columns={["name", "description"]}
              columnHeaders={["Advice", "Description"]}
              onAdd={() => openAddDialog("advice", "ADVICE")}
              onEdit={(item) => openAddDialog("advice", "ADVICE", item)}
              onDelete={(id) => handleDeleteEntity("advice", "ADVICE", id)}
            />
          </TabsContent>
        </Tabs>
      </div>

      <EntityFormDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        entity={currentEntity}
        category={currentCategory}
        item={editingItem}
        onSave={handleSaveEntity}
      />
    </div>
  );
};

const MasterDataTable = ({
  title,
  description,
  data,
  columns,
  columnHeaders,
  onAdd,
  onEdit,
  onDelete,
}: any) => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button onClick={onAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add New
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            {columnHeaders.map((header: string) => (
              <TableHead key={header}>{header}</TableHead>
            ))}
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columnHeaders.length + 2} className="text-center text-muted-foreground">
                No data available
              </TableCell>
            </TableRow>
          ) : (
            data.map((item: any) => (
              <TableRow key={item.id}>
                {columns.map((col: string) => (
                  <TableCell key={col}>
                    {col === "price" && item[col] ? `₹${item[col]}` : item[col] || "-"}
                  </TableCell>
                ))}
                <TableCell>
                  <Badge variant={item.isActive !== false ? "default" : "secondary"}>
                    {item.isActive !== false ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onDelete(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
};

const EntityFormDialog = ({ open, onOpenChange, entity, category, item, onSave }: any) => {
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (item) {
      setFormData(item);
    } else {
      setFormData({ isActive: true });
    }
  }, [item, open]);

  const handleSubmit = () => {
    onSave(formData);
  };

  const getFormFields = () => {
    switch (entity) {
      case "consultant":
        return [
          { name: "name", label: "Name", type: "text", required: true },
          { name: "specialization", label: "Specialization", type: "text" },
          { name: "qualification", label: "Qualification", type: "text" },
          { name: "contactNumber", label: "Contact Number", type: "text" },
          { name: "email", label: "Email", type: "email" },
        ];
      case "complaint":
      case "finding":
      case "advice":
        return [
          { name: "name", label: "Name", type: "text", required: true },
          { name: "description", label: "Description", type: "text" },
        ];
      case "diagnosis":
        return [
          { name: "name", label: "Name", type: "text", required: true },
          { name: "code", label: "ICD Code", type: "text" },
          { name: "description", label: "Description", type: "text" },
        ];
      case "drug":
        return [
          { name: "name", label: "Drug Name", type: "text", required: true },
          { name: "category", label: "Category", type: "select", options: ["Eye Drops", "Tablets", "Ointment", "Injection", "Other"] },
          { name: "strength", label: "Strength", type: "text" },
          { name: "manufacturer", label: "Manufacturer", type: "text" },
          { name: "price", label: "Price", type: "number" },
          { name: "stockQuantity", label: "Stock Quantity", type: "number" },
          { name: "minStockLevel", label: "Min Stock Level", type: "number" },
          { name: "unit", label: "Unit", type: "text" },
          { name: "instructionsTemplate", label: "Instructions Template", type: "text" },
        ];
      default:
        return [];
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {item ? "Edit" : "Add"} {entity?.charAt(0).toUpperCase() + entity?.slice(1)}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {getFormFields().map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </Label>
              {field.type === "select" ? (
                <Select
                  value={formData[field.name] || ""}
                  onValueChange={(value) => setFormData({ ...formData, [field.name]: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${field.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option: string) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : field.type === "number" ? (
                <Input
                  id={field.name}
                  type="number"
                  value={formData[field.name] || ""}
                  onChange={(e) => setFormData({ ...formData, [field.name]: parseFloat(e.target.value) || 0 })}
                />
              ) : (
                <Input
                  id={field.name}
                  type={field.type}
                  value={formData[field.name] || ""}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                />
              )}
            </div>
          ))}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive !== false}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <label htmlFor="isActive" className="text-sm font-medium">
                Active
              </label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Admin;
