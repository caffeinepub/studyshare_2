import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";

actor {
  include MixinStorage();

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  public type StudyMaterial = {
    id : Text;
    title : Text;
    description : Text;
    subjectId : Text;
    contentType : Text;
    blobId : Storage.ExternalBlob;
    isPremium : Bool;
    uploader : Principal;
    createdAt : Time.Time;
    tags : [Text];
    downloadCount : Nat;
  };

  public type Subject = {
    id : Text;
    name : Text;
    description : Text;
  };

  public type PurchaseRecord = {
    userId : Principal;
    materialId : Text;
    purchasedAt : Time.Time;
    stripeSessionId : Text;
  };

  public type StudyMaterialPublic = {
    id : Text;
    title : Text;
    description : Text;
    subjectId : Text;
    contentType : Text;
    blobId : ?Storage.ExternalBlob;
    isPremium : Bool;
    uploader : Principal;
    createdAt : Time.Time;
    tags : [Text];
    downloadCount : Nat;
  };

  // Data storage
  let studyMaterials = Map.empty<Text, StudyMaterial>();
  let subjects = Map.empty<Text, Subject>();
  let purchases = Map.empty<Text, PurchaseRecord>();
  var configuration : ?Stripe.StripeConfiguration = null;
  
  // Track admin assignment for claimAdminIfFirst
  var adminAssigned : Bool = false;
  
  // Track session ownership for authorization
  let sessionOwners = Map.empty<Text, Principal>();

  // Helper functions
  func userHasPurchased(user : Principal, materialId : Text) : Bool {
    purchases.values().any(
      func(p) { p.userId == user and p.materialId == materialId }
    );
  };

  func toPublicMaterial(material : StudyMaterial, caller : Principal) : StudyMaterialPublic {
    let hasAccess = not material.isPremium or AccessControl.isAdmin(accessControlState, caller) or userHasPurchased(caller, material.id);
    {
      id = material.id;
      title = material.title;
      description = material.description;
      subjectId = material.subjectId;
      contentType = material.contentType;
      blobId = if (hasAccess) { ?material.blobId } else { null };
      isPremium = material.isPremium;
      uploader = material.uploader;
      createdAt = material.createdAt;
      tags = material.tags;
      downloadCount = material.downloadCount;
    };
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (configuration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  // New claimAdminIfFirst function
  public shared ({ caller }) func claimAdminIfFirst() : async Bool {
    if (caller.isAnonymous()) { return false };
    if (adminAssigned) { return false };
    
    // Assign admin role to caller
    AccessControl.assignRole(accessControlState, caller, caller, #admin);
    adminAssigned := true;
    true;
  };

  // Study Material Operations
  public shared ({ caller }) func uploadMaterial(material : StudyMaterial) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can upload materials");
    };
    studyMaterials.add(material.id, material);
  };

  public query ({ caller }) func listMaterials(includePremium : Bool) : async [StudyMaterialPublic] {
    studyMaterials.values().toArray().filter(
      func(m) { not m.isPremium or (m.isPremium and includePremium) }
    ).map(func(m) { toPublicMaterial(m, caller) });
  };

  public query ({ caller }) func getMaterial(materialId : Text) : async ?StudyMaterialPublic {
    switch (studyMaterials.get(materialId)) {
      case (null) { null };
      case (?material) { ?toPublicMaterial(material, caller) };
    };
  };

  public query ({ caller }) func getMaterialBlobId(materialId : Text) : async ?Storage.ExternalBlob {
    switch (studyMaterials.get(materialId)) {
      case (?material) {
        if (not material.isPremium or AccessControl.isAdmin(accessControlState, caller) or userHasPurchased(caller, materialId)) {
          ?material.blobId;
        } else {
          null;
        };
      };
      case (_) { null };
    };
  };

  public shared ({ caller }) func deleteMaterial(materialId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete materials");
    };
    studyMaterials.remove(materialId);
  };

  public query ({ caller }) func getMaterialsBySubject(subjectId : Text) : async [StudyMaterialPublic] {
    studyMaterials.values().toArray().filter(
      func(m) { m.subjectId == subjectId }
    ).map(func(m) { toPublicMaterial(m, caller) });
  };

  public shared ({ caller }) func incrementDownloadCount(materialId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can increment download count");
    };
    switch (studyMaterials.get(materialId)) {
      case (null) { Runtime.trap("Material not found") };
      case (?material) {
        if (material.isPremium and not AccessControl.isAdmin(accessControlState, caller) and not userHasPurchased(caller, materialId)) {
          Runtime.trap("Unauthorized: Must purchase premium material before downloading");
        };
        let updatedMaterial = { material with downloadCount = material.downloadCount + 1 };
        studyMaterials.add(materialId, updatedMaterial);
      };
    };
  };

  public query ({ caller }) func searchMaterials(searchTerm : Text) : async [StudyMaterialPublic] {
    let lowerSearchTerm = searchTerm.toLower();
    studyMaterials.values().toArray().filter(
      func(m) {
        m.title.toLower().contains(#text lowerSearchTerm) or m.tags.any(
          func(tag) { tag.toLower().contains(#text lowerSearchTerm) }
        );
      }
    ).map(func(m) { toPublicMaterial(m, caller) });
  };

  // Subject Operations
  public query ({ caller }) func getSubjects() : async [Subject] {
    subjects.values().toArray();
  };

  public shared ({ caller }) func addSubject(subject : Subject) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add subjects");
    };
    subjects.add(subject.id, subject);
  };

  // Purchase Operations
  public shared ({ caller }) func recordPurchase(record : PurchaseRecord) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can record purchases");
    };
    purchases.add(record.stripeSessionId, record);
  };

  public query ({ caller }) func hasPurchased(materialId : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check purchase status");
    };
    userHasPurchased(caller, materialId);
  };

  public query ({ caller }) func getUserPurchases() : async [PurchaseRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view purchases");
    };
    purchases.values().toArray().filter(func(p) { p.userId == caller });
  };

  // Stripe Integrations
  public query func isStripeConfigured() : async Bool {
    configuration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set Stripe configuration");
    };
    configuration := ?config;
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check session status");
    };
    
    // Verify caller owns this session or is admin
    switch (sessionOwners.get(sessionId)) {
      case (?owner) {
        if (owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only check your own session status");
        };
      };
      case (null) {
        // Session not found in our records, only admins can query arbitrary sessions
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Session not found or access denied");
        };
      };
    };
    
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };
    
    let sessionId = await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
    
    // Track session ownership for authorization
    sessionOwners.add(sessionId, caller);
    
    sessionId;
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};
